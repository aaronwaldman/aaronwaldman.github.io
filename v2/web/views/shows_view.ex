defmodule V2.ShowsView do
	use V2.Web, :view

	def combineNames(firstName, lastName) do
		firstName <> lastName
	end
end