defmodule V2.FacebookWebhookController do
	use V2.Web, :controller

	def create(conn, params) do
		authenticate
		parsed = Poison.decode!(params)

		case parsed do
			%{object: "page"} -> handle_page_hook
			%{object: "user"} -> handle_user_hook
			%{object: "permissions"} -> handle_permissions_hook
		end	

		# Poison.decode!(params, as: %Shows{})
	end

	def authenticate do
		true
	end

	# Handle Pages data
	# The "right" way to do this would be to use a database and update based on changes.
	# This just requests the json file and then saves it.
	def handle_page_hook() do
		# Todo: check that shows have actually been updated before requesting
		V2.FacebookRequestController.update_shows
	end

	# Handle User Feed data
	def handle_user_hook() do

	end

	# Handle Permissions data
	def handle_permissions_hook() do

	end
end
