from django.db import models
from django.utils import timezone
from decimal import Decimal


class CurrencyRate(models.Model):
    """Stores exchange rates relative to USD for cross-regional salary parity."""
    code = models.CharField(max_length=3, unique=True, primary_key=True)  # USD, EUR, GBP, INR, etc.
    name = models.CharField(max_length=50)
    symbol = models.CharField(max_length=5)
    rate_to_usd = models.DecimalField(max_digits=12, decimal_places=6, help_text="Multiplier: Local * rate_to_usd = USD")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['code']

    def __str__(self):
        return f"{self.code} ({self.symbol}) - 1 {self.code} = {self.rate_to_usd} USD"


class Employee(models.Model):
    """
    Core employee entity representing ACME org workforce.
    Optimized for 10,000+ records with strategic compound indexing.
    """
    GENDER_CHOICES = [
        ('Female', 'Female'),
        ('Male', 'Male'),
        ('Non-Binary', 'Non-Binary'),
        ('Prefer not to say', 'Prefer not to say'),
    ]

    EMPLOYMENT_STATUS_CHOICES = [
        ('Full-Time', 'Full-Time'),
        ('Contract', 'Contract'),
        ('Part-Time', 'Part-Time'),
    ]

    employee_id = models.CharField(max_length=20, unique=True, db_index=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, db_index=True)
    department = models.CharField(max_length=100, db_index=True)
    job_title = models.CharField(max_length=100)
    country = models.CharField(max_length=100, db_index=True)
    city = models.CharField(max_length=100)
    currency = models.CharField(max_length=3, default='USD')
    gender = models.CharField(max_length=25, choices=GENDER_CHOICES, default='Prefer not to say')
    hire_date = models.DateField(default=timezone.now)
    employment_status = models.CharField(max_length=20, choices=EMPLOYMENT_STATUS_CHOICES, default='Full-Time')

    # USD-normalized base salary stored at write time to ensure sub-10ms aggregate analytics
    base_salary_usd = models.DecimalField(max_digits=14, decimal_places=2, db_index=True, default=Decimal('0.00'))

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-hire_date', 'employee_id']
        indexes = [
            models.Index(fields=['department', 'country'], name='idx_emp_dept_country'),
            models.Index(fields=['country', 'base_salary_usd'], name='idx_emp_ctry_sal'),
            models.Index(fields=['department', 'base_salary_usd'], name='idx_emp_dept_sal'),
            models.Index(fields=['gender', 'base_salary_usd'], name='idx_emp_gender_sal'),
        ]

    def __str__(self):
        return f"{self.employee_id} - {self.first_name} {self.last_name} ({self.department})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class SalaryStructure(models.Model):
    """
    Granular salary breakdown for an employee in their local currency.
    """
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='salary_structure')
    base_salary = models.DecimalField(max_digits=14, decimal_places=2, help_text="Annual base salary in local currency")
    bonus_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('10.00'), help_text="Target bonus percentage")
    housing_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    transport_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    other_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    tax_deduction_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('20.00'), help_text="Estimated tax rate %")
    retirement_contribution = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('5.00'), help_text="401k / Pension %")
    net_annual_salary = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    effective_from = models.DateField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def calculate_totals(self):
        """Computes gross and net annual salary."""
        bonus_val = self.base_salary * (self.bonus_percentage / Decimal('100.0'))
        total_allowances = self.housing_allowance + self.transport_allowance + self.other_allowance
        gross = self.base_salary + bonus_val + total_allowances
        tax = gross * (self.tax_deduction_rate / Decimal('100.0'))
        retirement = self.base_salary * (self.retirement_contribution / Decimal('100.0'))
        net = gross - tax - retirement
        return {
            'bonus_amount': round(bonus_val, 2),
            'total_allowances': round(total_allowances, 2),
            'gross_annual_salary': round(gross, 2),
            'tax_deduction_amount': round(tax, 2),
            'retirement_amount': round(retirement, 2),
            'net_annual_salary': round(net, 2),
        }

    def save(self, *args, **kwargs):
        totals = self.calculate_totals()
        self.net_annual_salary = totals['net_annual_salary']
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Salary for {self.employee.employee_id}: {self.base_salary} {self.employee.currency}"


class SalaryRevisionHistory(models.Model):
    """
    Audit trail capturing every historical compensation adjustment.
    """
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='revisions')
    previous_base = models.DecimalField(max_digits=14, decimal_places=2)
    new_base = models.DecimalField(max_digits=14, decimal_places=2)
    percentage_change = models.DecimalField(max_digits=6, decimal_places=2)
    currency = models.CharField(max_length=3)
    effective_date = models.DateField()
    reason = models.CharField(max_length=150)
    approved_by = models.CharField(max_length=100, default='Alex (HR Director)')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-effective_date', '-created_at']

    def __str__(self):
        return f"{self.employee.employee_id} revision: {self.previous_base} -> {self.new_base} ({self.percentage_change}%)"
