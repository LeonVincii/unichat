from django.core.exceptions import ValidationError
from django.contrib.auth.models import User


# Validate the username of a contact, check if this username exists.
def contact_username_validator(username):
	user = User.objects.filter(username = username)
	if not user:
		raise ValidationError('%(user)s doesn\'t exit', params = {'user': username})
