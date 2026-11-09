from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from compensation.models import Employee, SalaryStructure, SalaryRevisionHistory
from compensation.services import CurrencyService, CompensationAnalyticsService, SalaryRevisionService


class ServiceTests(TestCase):
    def setUp(self):
        CurrencyService.initialize_default_rates()
        # Seed 3 employees across different countries and genders
        self.emp1 = Employee.objects.create(
            employee_id="ACM-T001",
            first_name="Alice",
            last_name="Walker",
            email="alice.walker@acme.org",
            department="Engineering",
            job_title="Software Engineer",
            country="United States",
            city="San Francisco",
            currency="USD",
            gender="Female",
            hire_date=timezone.now().date(),
            employment_status="Full-Time",
            base_salary_usd=Decimal('100000.00'),
        )
        SalaryStructure.objects.create(
            employee=self.emp1,
            base_salary=Decimal('100000.00'),
            bonus_percentage=Decimal('10.00'),
            housing_allowance=Decimal('2000.00'),
            transport_allowance=Decimal('1000.00'),
            other_allowance=Decimal('0.00'),
            tax_deduction_rate=Decimal('20.00'),
            retirement_contribution=Decimal('5.00'),
        )

        self.emp2 = Employee.objects.create(
            employee_id="ACM-T002",
            first_name="Bob",
            last_name="Martin",
            email="bob.martin@acme.org",
            department="Engineering",
            job_title="Staff Engineer",
            country="United States",
            city="Seattle",
            currency="USD",
            gender="Male",
            hire_date=timezone.now().date(),
            employment_status="Full-Time",
            base_salary_usd=Decimal('150000.00'),
        )
        SalaryStructure.objects.create(
            employee=self.emp2,
            base_salary=Decimal('150000.00'),
            bonus_percentage=Decimal('15.00'),
            housing_allowance=Decimal('4000.00'),
            transport_allowance=Decimal('1000.00'),
            other_allowance=Decimal('0.00'),
            tax_deduction_rate=Decimal('20.00'),
            retirement_contribution=Decimal('5.00'),
        )

        self.emp3 = Employee.objects.create(
            employee_id="ACM-T003",
            first_name="Clara",
            last_name="Schumann",
            email="clara.schumann@acme.org",
            department="Product",
            job_title="Product Manager",
            country="Germany",
            city="Berlin",
            currency="EUR",
            gender="Female",
            hire_date=timezone.now().date(),
            employment_status="Full-Time",
            base_salary_usd=Decimal('86400.00'),  # 80000 * 1.08 = 86400
        )
        SalaryStructure.objects.create(
            employee=self.emp3,
            base_salary=Decimal('80000.00'),
            bonus_percentage=Decimal('10.00'),
            housing_allowance=Decimal('0.00'),
            transport_allowance=Decimal('0.00'),
            other_allowance=Decimal('0.00'),
            tax_deduction_rate=Decimal('25.00'),
            retirement_contribution=Decimal('5.00'),
        )

    def test_currency_conversion(self):
        # 1000 EUR to USD at 1.08 = 1080
        val = CurrencyService.convert_to_usd(Decimal('1000.00'), 'EUR')
        self.assertEqual(val, Decimal('1080.00'))

    def test_analytics_summary(self):
        summary = CompensationAnalyticsService.get_summary()
        self.assertEqual(summary['headcount'], 3)
        # Total: 100000 + 150000 + 86400 = 336400.00
        self.assertEqual(summary['total_spend_usd'], Decimal('336400.00'))
        self.assertEqual(summary['min_salary_usd'], Decimal('86400.00'))
        self.assertEqual(summary['max_salary_usd'], Decimal('150000.00'))
        self.assertEqual(summary['median_salary_usd'], Decimal('100000.00'))

    def test_analytics_by_department(self):
        dept_data = CompensationAnalyticsService.get_by_department()
        self.assertEqual(len(dept_data), 2)  # Engineering and Product
        eng = next(d for d in dept_data if d['department'] == 'Engineering')
        self.assertEqual(eng['headcount'], 2)
        self.assertEqual(eng['total_spend_usd'], Decimal('250000.00'))

    def test_salary_revision_application(self):
        rev = SalaryRevisionService.apply_revision(
            employee=self.emp1,
            new_base_salary=Decimal('120000.00'),
            reason="Promotion to Senior Software Engineer",
            approved_by="Alex HR",
            bonus_percentage=Decimal('12.00')
        )
        self.assertEqual(rev.previous_base, Decimal('100000.00'))
        self.assertEqual(rev.new_base, Decimal('120000.00'))
        self.assertEqual(rev.percentage_change, Decimal('20.00'))

        self.emp1.refresh_from_db()
        self.assertEqual(self.emp1.base_salary_usd, Decimal('120000.00'))
        self.assertEqual(self.emp1.salary_structure.base_salary, Decimal('120000.00'))
        self.assertEqual(self.emp1.salary_structure.bonus_percentage, Decimal('12.00'))
