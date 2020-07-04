// Includes
var http = require('../util/http.js').func
var getGeneralToken = require('../util/getGeneralToken.js').func


// Args
exports.required = ['group']
exports.optional = ['message', 'jar']

function getSocialLinks (groupId) {
    return new Promise((resolve, reject) => {
        var httpOpt = {
          url: `https://groups.roblox.com/v1/groups/${group}/social-links`,
          options: {
            method: 'GET',
            resolveWithFullResponse: true,
            jar: jar,
            headers: {
              'X-CSRF-TOKEN': xcsrf
            }
          }
        }
        return http(httpOpt)
        .then(function (res) {
            const responseData = JSON.parse(res.body)
            if (res.statusCode === 400) {
            reject(new Error('The group is invalid or does not exist.'))
            }
            if (responseData.shout === null) {
            reject(new Error('You do not have permissions to view the shout for the group.'))
            } else {
            resolve(responseData.shout)
            }
        })
        .catch(error => reject(error))
    })
}

function parseSocialLinks (data,type) {
    return new Promise((resolve, reject) => {
        for (i=0; i<data.length; i++) {
            if (data[i].Type == type) {
                resolve(data[i].id)
            } 
        }
        reject(null)
    })
}

function setSocialLink (group, type, title, url, jar, xcsrf) {
    return new Promise((resolve, reject) => {
        getSocialLinks(group).then((socialLinks) => {
            let socialLinkId = await parseSocialLinks(socialLinks,type)
            if (title === null) {
                title = type
            }
            if (socialLinkId === null) {
                var httpOpt = {
                    url: `https://groups.roblox.com/v1/groups/${group}/social-links/${socialLinkId}`,
                    options: {
                        method: 'PATCH',
                        resolveWithFullResponse: true,
                        json: {
                            type: type,
                            url: url,
                            title: title,
                        },
                        jar: jar,
                        headers: {
                            'X-CSRF-TOKEN': xcsrf
                        }
                    }
                }
            } else {
                var httpOpt = {
                    url: `https://groups.roblox.com/v1/groups/${group}/social-links `,
                    options: {
                        method: 'POST',
                        resolveWithFullResponse: true,
                        json: {
                            type: type,
                            url: url,
                            title: title,
                        },
                        jar: jar,
                        headers: {
                            'X-CSRF-TOKEN': xcsrf
                        }
                    }
                }
            }
            return http(httpOpt)
                .then(function (res) {
                if (res.statusCode === 200) {
                    resolve(res.body)
                } else {
                    const body = res.body || {}
                    if (body.errors && body.errors.length > 0) {
                        var errors = body.errors.map((e) => {
                        return e.message
                        })
                        reject(new Error(`${res.statusCode} ${errors.join(', ')}`))
                    } else {
                        reject(new Error(`${res.statusCode} ${res.body}`))
                    }
                }
            })
        })
    })
}

// Define
exports.func = function (args) {
  const jar = args.jar
  return getGeneralToken({ jar: jar })
    .then(function (xcsrf) {
      return setDescription(args.group, args.message, args.jar, xcsrf)
    })
}
