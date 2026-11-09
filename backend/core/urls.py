from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root_view(request):
    return JsonResponse({
        'service': 'ACME Enterprise Salary Management API',
        'status': 'OPERATIONAL',
        'version': '1.0.0',
        'author': 'Prashanth Chaduvala <prashanthpatelc@gmail.com>',
        'documentation': 'https://github.com/prashanthchaduvala/acme-salary-management',
        'endpoints': {
            'health': '/api/health/',
            'auth_login': '/api/auth/login/',
            'auth_register': '/api/auth/register/',
            'employees': '/api/employees/',
            'analytics_summary': '/api/analytics/summary/',
            'analytics_departments': '/api/analytics/departments/',
            'analytics_geo': '/api/analytics/geo/',
            'analytics_pay_parity': '/api/analytics/pay-parity/',
            'currencies': '/api/currencies/',
        }
    })

urlpatterns = [
    path('', api_root_view, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/', include('compensation.urls')),
]
