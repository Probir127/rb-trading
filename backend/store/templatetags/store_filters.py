from django import template
from django.contrib.humanize.templatetags.humanize import intcomma

register = template.Library()

@register.filter
def currency(value):
    """
    Formats a value as currency.
    Usage: {{ value|currency }}
    """
    try:
        value = round(float(value), 2)
        # You can make this symbol dynamic via settings if needed
        symbol = "Tk" 
        return f"{symbol} {intcomma(value)}"
    except (ValueError, TypeError):
        return f"Tk 0"
