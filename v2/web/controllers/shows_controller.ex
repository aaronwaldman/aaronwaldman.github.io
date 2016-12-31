require IEx;

defmodule V2.ShowsController do
	use V2.Web, :controller

	def index(conn, _params) do
		render conn, "index.html"
		#Find out how to add the id jump to to the end of the url
	end

	def setScroll(conn, %{"target" => target}) do
		IEx.pry
		render conn, "index.html", target: target
	end
end