from rest_framework import serializers
from decimal import Decimal
from django.utils import timezone
from .models import Employee, SalaryStructure, SalaryRevisionHistory, CurrencyRate
from .services import CurrencyService


class CurrencyRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurrencyRate
        fields = ['code', 'name', 'symbol', 'rate_to_usd', 'updated_at']


class SalaryRevisionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryRevisionHistory
        fields = [
            'id', 'employee', 'previous_base', 'new_base',
            'percentage_change', 'currency', 'effective_date',
            'reason', 'approved_by', 'created_at'
        ]
        read_only_fields = ['id', 'percentage_change', 'created_at']


class SalaryStructureSerializer(serializers.ModelSerializer):
    bonus_amount = serializers.SerializerMethodField()
    total_allowances = serializers.SerializerMethodField()
    gross_annual_salary = serializers.SerializerMethodField()
    tax_deduction_amount = serializers.SerializerMethodField()
    retirement_amount = serializers.SerializerMethodField()

    class Meta:
        model = SalaryStructure
        fields = [
            'id', 'base_salary', 'bonus_percentage', 'housing_allowance',
            'transport_allowance', 'other_allowance', 'tax_deduction_rate',
            'retirement_contribution', 'net_annual_salary', 'effective_from',
            'bonus_amount', 'total_allowances', 'gross_annual_salary',
            'tax_deduction_amount', 'retirement_amount', 'updated_at'
        ]

    def get_bonus_amount(self, obj):
        return obj.calculate_totals()['bonus_amount']

    def get_total_allowances(self, obj):
        return obj.calculate_totals()['total_allowances']

    def get_gross_annual_salary(self, obj):
        return obj.calculate_totals()['gross_annual_salary']

    def get_tax_deduction_amount(self, obj):
        return obj.calculate_totals()['tax_deduction_amount']

    def get_retirement_amount(self, obj):
        return obj.calculate_totals()['retirement_amount']


class EmployeeListSerializer(serializers.ModelSerializer):
    """
    Lightweight, high-speed serializer designed for paginating through 10,000 employees.
    Avoids heavy nested queries by pulling salary fields via select_related.
    """
    base_salary = serializers.DecimalField(
        source='salary_structure.base_salary',
        max_digits=14, decimal_places=2, read_only=True
    )
    bonus_percentage = serializers.DecimalField(
        source='salary_structure.bonus_percentage',
        max_digits=5, decimal_places=2, read_only=True
    )
    net_annual_salary = serializers.DecimalField(
        source='salary_structure.net_annual_salary',
        max_digits=14, decimal_places=2, read_only=True
    )

    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'first_name', 'last_name', 'full_name',
            'email', 'department', 'job_title', 'country', 'city',
            'currency', 'gender', 'hire_date', 'employment_status',
            'base_salary', 'bonus_percentage', 'net_annual_salary',
            'base_salary_usd', 'created_at', 'updated_at'
        ]


class EmployeeDetailSerializer(serializers.ModelSerializer):
    """
    Deep serialization used for employee detail view, modal dialogs, and revision audits.
    """
    salary_structure = SalaryStructureSerializer(read_only=True)
    revisions = SalaryRevisionHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'first_name', 'last_name', 'full_name',
            'email', 'department', 'job_title', 'country', 'city',
            'currency', 'gender', 'hire_date', 'employment_status',
            'base_salary_usd', 'salary_structure', 'revisions',
            'created_at', 'updated_at'
        ]


class EmployeeCreateSerializer(serializers.ModelSerializer):
    """
    Handles validated creation of an employee and their starting compensation package.
    """
    base_salary = serializers.DecimalField(max_digits=14, decimal_places=2, write_only=True)
    bonus_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, default=Decimal('10.00'), write_only=True)
    housing_allowance = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=Decimal('0.00'), write_only=True)
    transport_allowance = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=Decimal('0.00'), write_only=True)
    other_allowance = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=Decimal('0.00'), write_only=True)
    tax_deduction_rate = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, default=Decimal('20.00'), write_only=True)
    retirement_contribution = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, default=Decimal('5.00'), write_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'first_name', 'last_name', 'email',
            'department', 'job_title', 'country', 'city', 'currency',
            'gender', 'hire_date', 'employment_status',
            'base_salary', 'bonus_percentage', 'housing_allowance',
            'transport_allowance', 'other_allowance', 'tax_deduction_rate',
            'retirement_contribution'
        ]

    def create(self, validated_data):
        salary_fields = {
            'base_salary': validated_data.pop('base_salary'),
            'bonus_percentage': validated_data.pop('bonus_percentage', Decimal('10.00')),
            'housing_allowance': validated_data.pop('housing_allowance', Decimal('0.00')),
            'transport_allowance': validated_data.pop('transport_allowance', Decimal('0.00')),
            'other_allowance': validated_data.pop('other_allowance', Decimal('0.00')),
            'tax_deduction_rate': validated_data.pop('tax_deduction_rate', Decimal('20.00')),
            'retirement_contribution': validated_data.pop('retirement_contribution', Decimal('5.00')),
        }

        # Calculate normalized USD salary
        currency = validated_data.get('currency', 'USD')
        validated_data['base_salary_usd'] = CurrencyService.convert_to_usd(salary_fields['base_salary'], currency)

        employee = Employee.objects.create(**validated_data)
        SalaryStructure.objects.create(employee=employee, **salary_fields)
        return employee


class SalaryRevisionCreateSerializer(serializers.Serializer):
    new_base_salary = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=Decimal('100.00'))
    reason = serializers.CharField(max_length=150)
    effective_date = serializers.DateField(required=False, default=timezone.localdate)
    approved_by = serializers.CharField(max_length=100, required=False, default="Alex (HR Manager)")
    bonus_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
