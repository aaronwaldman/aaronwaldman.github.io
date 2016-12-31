# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# Configures the endpoint
config :v2, V2.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "tw7cu16A558JtdAGt4D8OLcWoXb6Mcfaf1rJtn2GG2XUqKnenZpxbyx+9K2UitBM",
  render_errors: [view: V2.ErrorView, accepts: ~w(html json)],
  pubsub: [name: V2.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
