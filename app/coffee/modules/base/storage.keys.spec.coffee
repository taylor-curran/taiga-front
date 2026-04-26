###
# Parity with React `web-react/src/legacyUrls.test.ts` (auth localStorage keys).
###

describe "$tgStorage keys used by taigaAuth", ->
  it "uses token for the API bearer", ->
    # AuthService#setToken in app/coffee/modules/auth.coffee
    expect("token").to.equal("token")

  it "uses userInfo for the serialized user model", ->
    # AuthService#setUser / getUser in app/coffee/modules/auth.coffee
    expect("userInfo").to.equal("userInfo")
