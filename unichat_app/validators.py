from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model


# Validate the username of a contact, check if this username exists.
def contact_username_validator(username):
	user = get_user_model().objects.filter(username = username)
	if not user:
		raise ValidationError('%(user)s doesn\'t exist', params = {'user': username})
