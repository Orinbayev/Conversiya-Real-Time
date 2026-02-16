from django.urls import path
from . import views

urlpatterns = [
    path('', views.currency_index, name='currency_index'),
    path('api/historical-rates/', views.get_historical_rates, name='historical_rates'),
]
