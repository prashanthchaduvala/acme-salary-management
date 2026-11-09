from django.test import TestCase
from django.core.management import call_command
from compensation.models import Employee, SalaryStructure, SalaryRevisionHistory, CurrencyRate


class SeederCommandTests(TestCase):
    def test_seed_salaries_custom_count(self):
        call_command('seed_salaries', count=50, clean=True)
        self.assertEqual(Employee.objects.count(), 50)
        self.assertEqual(SalaryStructure.objects.count(), 50)
        self.assertGreaterEqual(CurrencyRate.objects.count(), 8)
        # Check that normalized USD salary is populated
        for emp in Employee.objects.all():
            self.assertGreater(emp.base_salary_usd, 0)
            self.assertIsNotNone(emp.salary_structure)
