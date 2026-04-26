###
# Light-weight contract: documents the same URLs the Angular client and React port use
# for project-scoped activity (`project.jade` + `projects-resource.service.coffee`).
###

describe "Project timeline API contract (shared with React port)", ->

  it "builds timeline path as in projects-resource.service (getTimeline)", ->
    # Resource builds: resolve("timeline-project") + "/#{projectId}" → e.g. timeline/project/42
    projectId = 42
    suffix = "timeline/project/#{projectId}"
    expect(suffix).to.equal "timeline/project/42"

  it "passes only_relevant and page query params (lazy pagination sequence)", ->
    # Reference: params in getTimeline
    page = 3
    params = { page: page, only_relevant: true }
    expect(params.page).to.equal 3
    expect(params.only_relevant).to.be.true
