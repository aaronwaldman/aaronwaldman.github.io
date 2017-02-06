defmodule V2.FacebookRequestController do

	@fb_access_token "728356867267766%7CuWPPYMGHZ1jaSCy91XhfiJtupoU"
	@events_url "https://graph.facebook.com/aaronwaldmanmusic/events" 

	@json_write_path "/web/static/assets/json"
	@json_read_path "/web/priv/static/json"

	def update_shows do
		response = HTTPotion.get!(@events_url, query: %{accessToken: @fb_access_token})
		case response do
			%{status_code: 200} -> write_shows(response)
			_ -> raise response
		end
	end

	# Yeah... not secure
	def write_shows(response) do
		{:ok, file} = File.open! @json_write_path<>"/shows.json", [:write]
		IO.binwrite file, response
		File.close file
	end
end
