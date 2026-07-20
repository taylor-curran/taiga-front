###
# This source code is licensed under the terms of the
# GNU Affero General Public License found in the LICENSE file in
# the root directory of this source tree.
#
# Copyright (c) 2021-present Kaleidos INC
###

describe "LoginPage controller", ->
    provide = null
    $controller = null
    mocks = {}

    _mockCurrentUserService = () ->
        mocks.currentUserService = {
            isAuthenticated: sinon.stub()
        }
        provide.value "tgCurrentUserService", mocks.currentUserService

    _mockLocation = () ->
        mocks.location = {
            url: sinon.stub()
            search: sinon.stub().returns({})
        }
        provide.value "$tgLocation", mocks.location

    _mockNavUrls = () ->
        mocks.navUrls = {
            resolve: sinon.stub()
        }
        provide.value "$tgNavUrls", mocks.navUrls

    _mockRouteParams = () ->
        mocks.routeParams = {}
        provide.value "$routeParams", mocks.routeParams

    _mockAuth = () ->
        mocks.auth = {
            clear: sinon.stub()
            removeToken: sinon.stub()
        }
        provide.value "$tgAuth", mocks.auth

    _inject = (callback) ->
        inject (_$controller_) ->
            $controller = _$controller_
            callback() if callback

    beforeEach ->
        module "taigaAuth", ($provide) ->
            provide = $provide
            _mockCurrentUserService()
            _mockLocation()
            _mockNavUrls()
            _mockRouteParams()
            _mockAuth()
            return null
        _inject()

    it "redirects authenticated users to home when not forcing login", ->
        mocks.currentUserService.isAuthenticated.returns(true)
        mocks.routeParams.force_login = undefined
        mocks.navUrls.resolve.withArgs("home").returns("/")

        $controller("LoginPage")

        expect(mocks.location.url).to.have.been.calledWith("/")

    it "redirects authenticated users to decoded next when present", ->
        mocks.currentUserService.isAuthenticated.returns(true)
        mocks.routeParams.next = encodeURIComponent("/projects/")
        mocks.routeParams.force_login = undefined

        $controller("LoginPage")

        expect(mocks.location.url).to.have.been.calledWith("/projects/")
        expect(mocks.location.search).to.have.been.calledWith("next", null)

    it "clears session when unauthorized flag is set with next", ->
        mocks.currentUserService.isAuthenticated.returns(true)
        mocks.routeParams.unauthorized = true
        mocks.routeParams.next = encodeURIComponent("/admin")
        mocks.routeParams.force_login = undefined
        mocks.navUrls.resolve.withArgs("home").returns("/")

        $controller("LoginPage")

        expect(mocks.auth.clear).to.have.been.calledOnce
        expect(mocks.auth.removeToken).to.have.been.calledOnce
        expect(mocks.location.url).to.not.have.been.called

    it "does not redirect when force_login is set", ->
        mocks.currentUserService.isAuthenticated.returns(true)
        mocks.routeParams.force_login = true

        $controller("LoginPage")

        expect(mocks.location.url).to.not.have.been.called

    it "does nothing when not authenticated", ->
        mocks.currentUserService.isAuthenticated.returns(false)

        $controller("LoginPage")

        expect(mocks.location.url).to.not.have.been.called
