from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from compensation.models import Employee, SalaryStructure, CurrencyRate
from compensation.services import CurrencyService


class ViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        CurrencyService.initialize_default_rates()

        self.emp = Employee.objects.create(
            employee_id="ACM-00100",
            first_name="Grace",
            last_name="Hopper",
            email="grace.hopper@acme.org",
            department="Engineering",
            job_title="Lead Architect",
            country="United States",
            city="New York",
            currency="USD",
            gender="Female",
            hire_date=timezone.now().date(),
            employment_status="Full-Time",
            base_salary_usd=Decimal('160000.00'),
        )
        self.structure = SalaryStructure.objects.create(
            employee=self.emp,
            base_salary=Decimal('160000.00'),
            bonus_percentage=Decimal('15.00'),
            housing_allowance=Decimal('3000.00'),
            transport_allowance=Decimal('1000.00'),
            other_allowance=Decimal('0.00'),
            tax_deduction_rate=Decimal('22.00'),
            retirement_contribution=Decimal('6.00'),
        )

    def test_employee_list_api(self):
        url = reverse('employee-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['employee_id'], "ACM-00100")

    def test_employee_detail_api(self):
        url = reverse('employee-detail', kwargs={'pk': self.emp.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['employee_id'], "ACM-00100")
        self.assertIn('salary_structure', response.data)
        self.assertEqual(Decimal(str(response.data['salary_structure']['base_salary'])), Decimal('160000.00'))

    def test_employee_filter_by_department(self):
        url = reverse('employee-list')
        res = self.client.get(url, {'department': 'Engineering'})
        self.assertEqual(res.data['count'], 1)

        res_none = self.client.get(url, {'department': 'Marketing'})
        self.assertEqual(res_none.data['count'], 0)

    def test_salary_revision_endpoint(self):
        url = reverse('employee-revise-salary', kwargs={'pk': self.emp.pk})
        payload = {
            'new_base_salary': '180000.00',
            'reason': 'Merit Promotion to VP',
            'approved_by': 'Alex HR'
        }
        response = self.client.post(url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['revision']['new_base'], '180000.00')

        self.emp.refresh_from_db()
        self.assertEqual(self.emp.base_salary_usd, Decimal('180000.00'))
        self.assertEqual(self.emp.salary_structure.base_salary, Decimal('180000.00'))

    def test_analytics_endpoints(self):
        res = self.client.get(reverse('analytics-summary'))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['headcount'], 1)
        self.assertEqual(Decimal(str(res.data['total_spend_usd'])), Decimal('160000.00'))

        res_dept = self.client.get(reverse('analytics-departments'))
        self.assertEqual(res_dept.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_dept.data), 1)

        res_geo = self.client.get(reverse('analytics-geo'))
        self.assertEqual(res_geo.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_geo.data), 1)

        res_parity = self.client.get(reverse('analytics-pay-parity'))
        self.assertEqual(res_parity.status_code, status.HTTP_200_OK)
        self.assertIn('gender_distribution', res_parity.data)

    def test_export_csv_endpoint(self):
        url = reverse('employee-export-csv')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')
        content = response.content.decode('utf-8')
        self.assertIn('ACM-00100', content)
        self.assertIn('Grace', content)
        self.assertIn('Hopper', content)

    def test_health_check_endpoint(self):
        url = reverse('health-check')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'healthy')
        self.assertEqual(response.data['total_employees'], 1)
