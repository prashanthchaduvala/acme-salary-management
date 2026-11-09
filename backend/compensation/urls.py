from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmployeeViewSet,
    analytics_summary,
    analytics_departments,
    analytics_geography,
    analytics_pay_parity,
    currency_list,
    health_check,
)

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')

urlpatterns = [
    path('', include(router.urls)),
    path('analytics/summary/', analytics_summary, name='analytics-summary'),
    path('analytics/departments/', analytics_departments, name='analytics-departments'),
    path('analytics/geo/', analytics_geography, name='analytics-geo'),
    path('analytics/pay-parity/', analytics_pay_parity, name='analytics-pay-parity'),
    path('currencies/', currency_list, name='currency-list'),
    path('health/', health_check, name='health-check'),
]
