from django.core.exceptions import ValidationError

import re


def signup_username_validator(username):
	if not re.match(r'^[\w._-]+$', username):
		raise ValidationError('Usernames can only contain letters, numbers, dots(.), underscores(_) and hyphens(-).')
