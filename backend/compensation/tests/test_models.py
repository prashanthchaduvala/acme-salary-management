from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from compensation.models import Employee, SalaryStructure, SalaryRevisionHistory, CurrencyRate
from compensation.services import CurrencyService


class ModelTests(TestCase):
    def setUp(self):
        CurrencyService.initialize_default_rates()
        self.employee = Employee.objects.create(
            employee_id="ACM-00001",
            first_name="Ada",
            last_name="Lovelace",
            email="ada.lovelace@acme.org",
            department="Engineering",
            job_title="Principal Architect",
            country="United Kingdom",
            city="London",
            currency="GBP",
            gender="Female",
            hire_date=timezone.now().date(),
            employment_status="Full-Time",
            base_salary_usd=Decimal('128000.00'),
        )
        self.structure = SalaryStructure.objects.create(
            employee=self.employee,
            base_salary=Decimal('100000.00'),
            bonus_percentage=Decimal('15.00'),
            housing_allowance=Decimal('5000.00'),
            transport_allowance=Decimal('2000.00'),
            other_allowance=Decimal('1000.00'),
            tax_deduction_rate=Decimal('20.00'),
            retirement_contribution=Decimal('5.00'),
        )

    def test_employee_creation_and_string(self):
        self.assertEqual(str(self.employee), "ACM-00001 - Ada Lovelace (Engineering)")
        self.assertEqual(self.employee.full_name, "Ada Lovelace")

    def test_salary_structure_calculations(self):
        totals = self.structure.calculate_totals()
        # base: 100000, bonus 15%: 15000, allowances: 8000 => Gross: 123000
        # tax 20% of 123000 = 24600
        # retirement 5% of base (100000) = 5000
        # net = 123000 - 24600 - 5000 = 93400
        self.assertEqual(totals['bonus_amount'], Decimal('15000.00'))
        self.assertEqual(totals['total_allowances'], Decimal('8000.00'))
        self.assertEqual(totals['gross_annual_salary'], Decimal('123000.00'))
        self.assertEqual(totals['tax_deduction_amount'], Decimal('24600.00'))
        self.assertEqual(totals['retirement_amount'], Decimal('5000.00'))
        self.assertEqual(totals['net_annual_salary'], Decimal('93400.00'))
        self.assertEqual(self.structure.net_annual_salary, Decimal('93400.00'))

    def test_salary_revision_history(self):
        rev = SalaryRevisionHistory.objects.create(
            employee=self.employee,
            previous_base=Decimal('90000.00'),
            new_base=Decimal('100000.00'),
            percentage_change=Decimal('11.11'),
            currency='GBP',
            effective_date=timezone.now().date(),
            reason='Annual Merit Review',
            approved_by='Alex (HR Manager)'
        )
        self.assertEqual(rev.employee, self.employee)
        self.assertEqual(rev.percentage_change, Decimal('11.11'))
        self.assertIn("ACM-00001 revision", str(rev))
