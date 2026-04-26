###
# Parity checks for React port: navigation URL names must match $tgNavUrls.resolve output.
###

describe "$tgNavUrls parity (React port)", ->
    navUrls = null

    beforeEach module "taigaBase"

    beforeEach inject ($tgNavUrls) ->
        navUrls = $tgNavUrls

    it "resolves discover and discover-search without leading slash", ->
        expect(navUrls.resolve("discover")).to.equal("discover")
        expect(navUrls.resolve("discover-search")).to.equal("discover/search")

    it "resolves home", ->
        expect(navUrls.resolve("home")).to.equal("")
