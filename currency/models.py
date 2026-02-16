from django.db import models

class Currency(models.Model):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    buy_price = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    sell_price = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    cb_price = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    flag_url = models.URLField(max_length=200, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

    class Meta:
        verbose_name_plural = "Currencies"
