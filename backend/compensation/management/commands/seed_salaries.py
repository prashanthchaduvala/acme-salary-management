import time
import random
from decimal import Decimal
from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

from compensation.models import Employee, SalaryStructure, SalaryRevisionHistory, CurrencyRate, UserProfile
from compensation.services import CurrencyService, DEFAULT_CURRENCIES

FIRST_NAMES = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
    'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
    'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
    'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
    'Priya', 'Aarav', 'Neha', 'Rohan', 'Ananya', 'Vikram', 'Pooja', 'Rahul', 'Sneha',
    'Wei', 'Li', 'Zhang', 'Chen', 'Yan', 'Hiroshi', 'Yuki', 'Kenji', 'Sakura', 'Aoi',
    'Lukas', 'Emma', 'Leon', 'Mia', 'Maximilian', 'Sophie', 'Felix', 'Hannah',
    'Oliver', 'Charlotte', 'Liam', 'Amelia', 'Jack', 'Isla', 'Noah', 'Ava'
]

LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
    'Sharma', 'Patel', 'Verma', 'Gupta', 'Singh', 'Reddy', 'Nair', 'Iyer',
    'Tanaka', 'Sato', 'Suzuki', 'Takahashi', 'Watanabe', 'Ito', 'Yamamoto',
    'Muller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner',
    'Davies', 'Evans', 'Taylor', 'Murphy', 'O\'Connor', 'Kelly', 'Byrne'
]

DEPARTMENTS = [
    ('Engineering', ['Software Engineer', 'Senior Software Engineer', 'Staff Engineer', 'Principal Architect', 'Engineering Manager', 'Director of Engineering', 'VP of Engineering', 'DevOps Specialist', 'QA Automation Engineer']),
    ('Product', ['Associate Product Manager', 'Product Manager', 'Senior Product Manager', 'Lead Product Manager', 'Director of Product', 'VP of Product']),
    ('Design', ['UI Designer', 'Product Designer', 'Senior UX Designer', 'Lead Product Designer', 'Design System Lead', 'Head of Design']),
    ('Sales', ['Account Executive', 'Senior Enterprise AE', 'Sales Development Rep', 'Regional Sales Director', 'VP of Global Sales', 'Sales Ops Analyst']),
    ('Marketing', ['Content Strategist', 'Growth Marketer', 'Performance Marketing Lead', 'Product Marketing Manager', 'Brand Director', 'VP of Marketing']),
    ('HR', ['People Operations Associate', 'HR Business Partner', 'Senior HRBP', 'Total Rewards Specialist', 'Head of Talent Acquisition', 'VP of People']),
    ('Finance', ['Financial Analyst', 'Senior Corporate Accountant', 'Finance Manager', 'Controller', 'Director of Strategic Finance', 'VP of Finance']),
    ('Operations', ['Operations Coordinator', 'Operations Specialist', 'Business Operations Manager', 'Director of Global Operations', 'VP of Operations']),
]

REGIONS = [
    {
        'country': 'United States',
        'cities': ['San Francisco', 'New York', 'Austin', 'Seattle', 'Chicago'],
        'currency': 'USD',
        'rate_to_usd': Decimal('1.000000'),
        'base_range': (75000, 240000),
        'weight': 35,  # 35% of org
    },
    {
        'country': 'United Kingdom',
        'cities': ['London', 'Manchester', 'Edinburgh', 'Cambridge'],
        'currency': 'GBP',
        'rate_to_usd': Decimal('1.280000'),
        'base_range': (45000, 160000),
        'weight': 15,
    },
    {
        'country': 'Germany',
        'cities': ['Berlin', 'Munich', 'Frankfurt', 'Hamburg'],
        'currency': 'EUR',
        'rate_to_usd': Decimal('1.080000'),
        'base_range': (52000, 165000),
        'weight': 12,
    },
    {
        'country': 'India',
        'cities': ['Bangalore', 'Hyderabad', 'Pune', 'Gurgaon'],
        'currency': 'INR',
        'rate_to_usd': Decimal('0.012000'),
        'base_range': (850000, 5200000),
        'weight': 18,
    },
    {
        'country': 'Singapore',
        'cities': ['Singapore'],
        'currency': 'SGD',
        'rate_to_usd': Decimal('0.740000'),
        'base_range': (65000, 220000),
        'weight': 6,
    },
    {
        'country': 'Japan',
        'cities': ['Tokyo', 'Osaka', 'Kyoto'],
        'currency': 'JPY',
        'rate_to_usd': Decimal('0.006500'),
        'base_range': (6000000, 21000000),
        'weight': 5,
    },
    {
        'country': 'Australia',
        'cities': ['Sydney', 'Melbourne', 'Brisbane'],
        'currency': 'AUD',
        'rate_to_usd': Decimal('0.650000'),
        'base_range': (80000, 230000),
        'weight': 5,
    },
    {
        'country': 'Canada',
        'cities': ['Toronto', 'Vancouver', 'Montreal'],
        'currency': 'CAD',
        'rate_to_usd': Decimal('0.730000'),
        'base_range': (72000, 215000),
        'weight': 4,
    },
]

GENDER_DISTRIBUTION = [
    ('Female', 45),
    ('Male', 48),
    ('Non-Binary', 4),
    ('Prefer not to say', 3),
]

STATUS_DISTRIBUTION = [
    ('Full-Time', 90),
    ('Contract', 7),
    ('Part-Time', 3),
]

REVISION_REASONS = [
    'Annual Merit Review',
    'Promotion to Senior Grade',
    'Market Compensation Alignment',
    'Internal Equity Parity Adjustment',
    'Role Expansion & Responsibility Increment',
]


class Command(BaseCommand):
    help = 'Seeds ACME organization salary database with realistic records (default: 10,000 employees).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=10000,
            help='Number of employees to generate (default: 10,000)'
        )
        parser.add_argument(
            '--clean',
            action='store_true',
            help='Purges existing employee and salary records before seeding'
        )

    def handle(self, *args, **options):
        count = options['count']
        clean = options['clean']

        self.stdout.write(self.style.NOTICE(f"=== ACME Organization Salary Seeder (Target: {count:,} employees) ==="))
        start_time = time.time()

        # Step 1: Ensure Currency rates and default HR users are present
        CurrencyService.initialize_default_rates()
        default_users = [
            {'u': 'alex.hr', 'e': 'alex.hr@acme.org', 'p': 'Password123!', 'f': 'Alex', 'l': 'Rivera', 'r': 'Head of HR & Total Rewards', 'd': 'People Operations'},
            {'u': 'pchaduvala', 'e': 'pchaduvala@gmail.com', 'p': 'Password123!', 'f': 'Praveen', 'l': 'Chaduvala', 'r': 'HR Operations Lead', 'd': 'Global People & Compensation'}
        ]
        for du in default_users:
            usr, created = User.objects.get_or_create(
                username=du['u'],
                defaults={'email': du['e'], 'first_name': du['f'], 'last_name': du['l']}
            )
            usr.set_password(du['p'])
            usr.save()
            UserProfile.objects.update_or_create(user=usr, defaults={'role': du['r'], 'department': du['d']})
            Token.objects.get_or_create(user=usr)

        self.stdout.write(self.style.SUCCESS("[1/4] Currency exchange rates & HR accounts initialized."))

        # Step 2: Clean existing records if requested
        if clean:
            self.stdout.write("Purging existing records...")
            SalaryRevisionHistory.objects.all().delete()
            SalaryStructure.objects.all().delete()
            Employee.objects.all().delete()
            self.stdout.write(self.style.WARNING("Existing database records wiped cleanly."))

        existing_count = Employee.objects.count()
        if existing_count >= count:
            self.stdout.write(self.style.SUCCESS(f"Database already has {existing_count:,} employees. No additional seeding needed."))
            return

        needed = count - existing_count
        self.stdout.write(f"Generating {needed:,} realistic employee records...")

        # Setup weighted random selectors
        region_choices = []
        for r in REGIONS:
            region_choices.extend([r] * r['weight'])

        gender_choices = []
        for g, w in GENDER_DISTRIBUTION:
            gender_choices.extend([g] * w)

        status_choices = []
        for s, w in STATUS_DISTRIBUTION:
            status_choices.extend([s] * w)

        # Batch construction
        employees_to_create = []
        structures_to_create = []
        revisions_to_create = []

        today = timezone.now().date()
        random.seed(42)  # Deterministic repeatability

        self.stdout.write("[2/4] Building memory objects with realistic compensation distributions...")
        for i in range(1, needed + 1):
            emp_number = existing_count + i
            emp_code = f"ACM-{emp_number:05d}"

            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            email = f"{first.lower()}.{last.lower()}.{emp_number}@acme.org"

            dept_name, titles = random.choice(DEPARTMENTS)
            title = random.choice(titles)

            region = random.choice(region_choices)
            country = region['country']
            city = random.choice(region['cities'])
            currency = region['currency']
            rate_to_usd = region['rate_to_usd']

            gender = random.choice(gender_choices)
            status = random.choice(status_choices)

            # Seniority scaling
            if any(term in title for term in ['VP', 'Director', 'Head', 'Principal']):
                factor = random.uniform(0.75, 1.0)
            elif any(term in title for term in ['Senior', 'Lead', 'Manager']):
                factor = random.uniform(0.45, 0.75)
            else:
                factor = random.uniform(0.1, 0.45)

            min_sal, max_sal = region['base_range']
            base_salary_val = round(min_sal + (max_sal - min_sal) * factor, -2)
            base_salary = Decimal(str(base_salary_val))
            base_usd = round(base_salary * rate_to_usd, 2)

            hire_days_ago = random.randint(30, 2190)  # Up to 6 years tenure
            hire_date = today - timedelta(days=hire_days_ago)

            emp = Employee(
                employee_id=emp_code,
                first_name=first,
                last_name=last,
                email=email,
                department=dept_name,
                job_title=title,
                country=country,
                city=city,
                currency=currency,
                gender=gender,
                hire_date=hire_date,
                employment_status=status,
                base_salary_usd=base_usd,
            )
            employees_to_create.append(emp)

            # Bonus & Allowances
            bonus_pct = Decimal(str(random.choice([8.0, 10.0, 12.0, 15.0, 20.0, 25.0])))
            housing = Decimal(str(round(base_salary_val * random.uniform(0.04, 0.12), -1)))
            transport = Decimal(str(round(base_salary_val * random.uniform(0.02, 0.05), -1)))
            other = Decimal('0.00')

            bonus_amount = base_salary * (bonus_pct / Decimal('100.0'))
            total_allowances = housing + transport + other
            gross = base_salary + bonus_amount + total_allowances

            tax_rate = Decimal(str(random.choice([18.0, 20.0, 22.0, 25.0, 28.0])))
            retire_rate = Decimal(str(random.choice([4.0, 5.0, 6.0, 8.0])))

            tax_val = gross * (tax_rate / Decimal('100.0'))
            retire_val = base_salary * (retire_rate / Decimal('100.0'))
            net_annual = round(gross - tax_val - retire_val, 2)

            struct = SalaryStructure(
                employee=emp,
                base_salary=base_salary,
                bonus_percentage=bonus_pct,
                housing_allowance=housing,
                transport_allowance=transport,
                other_allowance=other,
                tax_deduction_rate=tax_rate,
                retirement_contribution=retire_rate,
                net_annual_salary=net_annual,
                effective_from=hire_date + timedelta(days=365) if hire_days_ago > 365 else hire_date
            )
            structures_to_create.append(struct)

            # Historical Revisions for ~35% of workforce with >1 year tenure
            if hire_days_ago > 365 and random.random() < 0.35:
                num_revisions = 1 if hire_days_ago < 730 else random.randint(1, 2)
                cur_base = base_salary
                for r_idx in range(num_revisions):
                    pct_inc = Decimal(str(round(random.uniform(5.0, 18.0), 2)))
                    prev_base = round(cur_base / (Decimal('1.0') + (pct_inc / Decimal('100.0'))), -2)
                    rev_date = today - timedelta(days=random.randint(60, hire_days_ago - 30))
                    rev = SalaryRevisionHistory(
                        employee=emp,
                        previous_base=prev_base,
                        new_base=cur_base,
                        percentage_change=pct_inc,
                        currency=currency,
                        effective_date=rev_date,
                        reason=random.choice(REVISION_REASONS),
                        approved_by='Alex (HR Director)'
                    )
                    revisions_to_create.append(rev)
                    cur_base = prev_base

        # Step 3: High-Performance Bulk Creation in Single Transaction
        self.stdout.write("[3/4] Executing batch database bulk inserts...")
        with transaction.atomic():
            created_emps = Employee.objects.bulk_create(employees_to_create, batch_size=1000)
            
            # Re-associate created employee instances to structures and revisions
            for emp_obj, struct_obj in zip(created_emps, structures_to_create):
                struct_obj.employee_id = emp_obj.id

            SalaryStructure.objects.bulk_create(structures_to_create, batch_size=1000)
            
            for rev in revisions_to_create:
                rev.employee_id = rev.employee.id

            SalaryRevisionHistory.objects.bulk_create(revisions_to_create, batch_size=1000)

        elapsed = time.time() - start_time
        total_now = Employee.objects.count()
        rev_count = SalaryRevisionHistory.objects.count()

        self.stdout.write(self.style.SUCCESS(
            f"[4/4] Successfully seeded database!\n"
            f"  - Total Employees: {total_now:,}\n"
            f"  - Salary Structures: {total_now:,}\n"
            f"  - Historical Revisions Logged: {rev_count:,}\n"
            f"  - Total Elapsed Time: {elapsed:.2f} seconds ({total_now / elapsed:.0f} rows/sec)"
        ))
