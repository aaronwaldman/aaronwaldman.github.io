defmodule V2.LayoutController do
  use V2.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
