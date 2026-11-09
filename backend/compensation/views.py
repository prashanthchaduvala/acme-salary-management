import csv
from decimal import Decimal
from django.http import HttpResponse
from django.db.models import Q
from django.contrib.auth import login, logout
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.authtoken.models import Token

from .models import Employee, CurrencyRate, UserProfile
from .serializers import (
    EmployeeListSerializer,
    EmployeeDetailSerializer,
    EmployeeCreateSerializer,
    SalaryRevisionCreateSerializer,
    SalaryRevisionHistorySerializer,
    CurrencyRateSerializer,
    UserRegisterSerializer,
    UserLoginSerializer,
    UserDetailSerializer,
)
from .services import (
    CompensationAnalyticsService,
    SalaryRevisionService,
    CurrencyService,
)


# ==========================================
# Authentication Endpoints
# ==========================================

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Creates a new HR user account and returns an auth token."""
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        user_data = UserDetailSerializer(user).data
        return Response({
            'message': 'Account created successfully.',
            'token': token.key,
            'user': user_data,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Authenticates an HR user and returns an auth token."""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        try:
            login(request, user)
        except Exception:
            pass  # Session login is optional fallback; Token auth is primary
        user_data = UserDetailSerializer(user).data
        return Response({
            'message': 'Login successful.',
            'token': token.key,
            'user': user_data,
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_user(request):
    """Logs out user and invalidates auth token safely."""
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Token '):
        token_key = auth_header.split(' ')[1].strip()
        Token.objects.filter(key=token_key).delete()

    if request.user.is_authenticated:
        Token.objects.filter(user=request.user).delete()
        logout(request)

    return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def current_user(request):
    """Returns currently authenticated user profile safely."""
    user = request.user
    if not user.is_authenticated:
        # Check Token header manually in case standard middleware didn't authenticate
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Token '):
            token_key = auth_header.split(' ')[1].strip()
            token_obj = Token.objects.filter(key=token_key).select_related('user').first()
            if token_obj and token_obj.user.is_active:
                user = token_obj.user

    if user and user.is_authenticated:
        user_data = UserDetailSerializer(user).data
        return Response({'isAuthenticated': True, 'user': user_data}, status=status.HTTP_200_OK)

    return Response({'isAuthenticated': False, 'user': None}, status=status.HTTP_200_OK)


# ==========================================
# Employee & Salary Registry Endpoints
# ==========================================

class EmployeePagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100


def apply_employee_filters(queryset, params):
    """Reusable filtering logic for both the Employee table and contextual Analytics."""
    department = params.get('department')
    if department and department.lower() != 'all':
        queryset = queryset.filter(department__iexact=department)

    country = params.get('country')
    if country and country.lower() != 'all':
        queryset = queryset.filter(country__iexact=country)

    currency = params.get('currency')
    if currency and currency.lower() != 'all':
        queryset = queryset.filter(currency__iexact=currency)

    gender = params.get('gender')
    if gender and gender.lower() != 'all':
        queryset = queryset.filter(gender__iexact=gender)

    employment_status = params.get('employment_status')
    if employment_status and employment_status.lower() != 'all':
        queryset = queryset.filter(employment_status__iexact=employment_status)

    min_salary = params.get('min_salary')
    if min_salary:
        try:
            queryset = queryset.filter(base_salary_usd__gte=Decimal(min_salary))
        except (ValueError, TypeError):
            pass

    max_salary = params.get('max_salary')
    if max_salary:
        try:
            queryset = queryset.filter(base_salary_usd__lte=Decimal(max_salary))
        except (ValueError, TypeError):
            pass

    search = params.get('search')
    if search:
        search = search.strip()
        queryset = queryset.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(email__icontains=search) |
            Q(employee_id__icontains=search) |
            Q(job_title__icontains=search)
        )

    return queryset


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Employee Salary Management.
    Optimized for 10,000+ employees with database indexes and select_related.
    """
    pagination_class = EmployeePagination

    def get_queryset(self):
        qs = Employee.objects.select_related('salary_structure').all()
        qs = apply_employee_filters(qs, self.request.query_params)

        # Ordering support
        ordering = self.request.query_params.get('ordering', '-hire_date')
        allowed_orderings = [
            'employee_id', '-employee_id',
            'last_name', '-last_name',
            'department', '-department',
            'country', '-country',
            'base_salary_usd', '-base_salary_usd',
            'hire_date', '-hire_date',
        ]
        if ordering in allowed_orderings:
            qs = qs.order_by(ordering)
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer
        elif self.action == 'retrieve':
            return EmployeeDetailSerializer
        elif self.action == 'create':
            return EmployeeCreateSerializer
        return EmployeeDetailSerializer

    @action(detail=True, methods=['post'], url_path='revise-salary')
    def revise_salary(self, request, pk=None):
        employee = self.get_object()
        serializer = SalaryRevisionCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        approver = 'Alex (HR Manager)'
        if request.user.is_authenticated:
            approver = f"{request.user.first_name or request.user.username} ({getattr(getattr(request.user, 'profile', None), 'role', 'HR')})"

        data = serializer.validated_data
        revision = SalaryRevisionService.apply_revision(
            employee=employee,
            new_base_salary=data['new_base_salary'],
            reason=data['reason'],
            approved_by=data.get('approved_by') or approver,
            effective_date=data.get('effective_date'),
            bonus_percentage=data.get('bonus_percentage')
        )

        detail_serializer = EmployeeDetailSerializer(employee)
        return Response({
            'message': 'Salary successfully revised and logged to audit trail.',
            'employee': detail_serializer.data,
            'revision': SalaryRevisionHistorySerializer(revision).data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='export-csv')
    def export_csv(self, request):
        qs = self.get_queryset()
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="acme_employees_salary_export.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Employee ID', 'First Name', 'Last Name', 'Email',
            'Department', 'Job Title', 'Country', 'City', 'Currency',
            'Base Salary (Local)', 'Bonus %', 'Net Annual Salary',
            'Base Salary (USD)', 'Gender', 'Employment Status', 'Hire Date'
        ])

        for emp in qs.iterator(chunk_size=1000):
            struct = getattr(emp, 'salary_structure', None)
            base_sal = struct.base_salary if struct else ''
            bonus_pct = struct.bonus_percentage if struct else ''
            net_sal = struct.net_annual_salary if struct else ''

            writer.writerow([
                emp.employee_id, emp.first_name, emp.last_name, emp.email,
                emp.department, emp.job_title, emp.country, emp.city, emp.currency,
                base_sal, bonus_pct, net_sal, emp.base_salary_usd,
                emp.gender, emp.employment_status, emp.hire_date
            ])

        return response


# ==========================================
# Analytics Endpoints
# ==========================================

@api_view(['GET'])
def analytics_summary(request):
    """Returns top-line organizational salary metrics."""
    qs = apply_employee_filters(Employee.objects.all(), request.query_params)
    data = CompensationAnalyticsService.get_summary(qs)
    return Response(data)


@api_view(['GET'])
def analytics_departments(request):
    """Returns payroll distribution by department."""
    qs = apply_employee_filters(Employee.objects.all(), request.query_params)
    data = CompensationAnalyticsService.get_by_department(qs)
    return Response(data)


@api_view(['GET'])
def analytics_geography(request):
    """Returns headcount and salary metrics by country."""
    qs = apply_employee_filters(Employee.objects.all(), request.query_params)
    data = CompensationAnalyticsService.get_by_geography(qs)
    return Response(data)


@api_view(['GET'])
def analytics_pay_parity(request):
    """Returns gender pay equity ratio and compensation tiers."""
    qs = apply_employee_filters(Employee.objects.all(), request.query_params)
    data = CompensationAnalyticsService.get_pay_parity(qs)
    return Response(data)


@api_view(['GET'])
def currency_list(request):
    """Lists all configured exchange rates with live conversion metadata."""
    CurrencyService.initialize_default_rates()
    currencies = CurrencyRate.objects.all()
    serializer = CurrencyRateSerializer(currencies, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def health_check(request):
    """Readiness probe for container orchestration."""
    total_employees = Employee.objects.count()
    return Response({
        'status': 'healthy',
        'service': 'acme-salary-management-api',
        'database': 'connected',
        'total_employees': total_employees,
    })
