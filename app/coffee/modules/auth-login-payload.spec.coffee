###
# Parity with `$tgAuth.login` request body: credentials plus `type` (default `normal`).
# See `app/coffee/modules/auth.coffee` → `AuthService::login`.
###

describe "Auth login request payload (reference)", () ->

  buildLoginBody = (data, type) ->
    out = {}
    for k, v of data
      out[k] = v
    out.type = if type then type else "normal"
    out

  it "merges type normal for default login", () ->
    d = buildLoginBody({username: "admin", password: "x"}, "normal")
    expect(d).to.eql {username: "admin", password: "x", type: "normal"}

  it "passes through invitation token on login with invitation", () ->
    d = buildLoginBody({
      username: "u", password: "p", invitation_token: "abc"
    }, "normal")
    expect(d.type).to.equal "normal"
    expect(d.invitation_token).to.equal "abc"
