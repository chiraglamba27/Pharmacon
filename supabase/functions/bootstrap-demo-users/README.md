# Bootstrap demo users

Deploy this Edge Function and invoke it once with `POST /functions/v1/bootstrap-demo-users`.

Set the `PHARMACON_BOOTSTRAP_SECRET` Edge Function secret and send it as the `x-bootstrap-secret` header when invoking the function. It creates the eight demo Supabase Auth accounts and their `profiles` rows. The password defaults to `admin123` and can be overridden with the `PHARMACON_DEMO_PASSWORD` Edge Function secret.
