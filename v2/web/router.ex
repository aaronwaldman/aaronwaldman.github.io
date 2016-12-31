defmodule V2.Router do
  use V2.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", V2 do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index

    resources "/shows", ShowsController, only: [:index, :show]
    resources "/contact", ContactController, except: [:delete]
  end

  scope "/admin", V2.Admin, as: :admin do
    pipe_through :browser

    resources "/shows", ShowsController
    resources "/contact", ContactController
  end

  # Other scopes may use custom stacks.
  # scope "/api", V2 do
  #   pipe_through :api
  # end
end
