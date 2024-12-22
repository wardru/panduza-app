# Commiting/Tagging in CI

Having commits and tags signed on GitHub actions has proven quite challenging because of scattered information and many different approaches. So here's some distilled documentation capturing those approaches.

## Unsigned

Committing on GitHub action is quite trivial if no signatures are required. This would suffice.

```GitHub
jobs:
  commit_on_ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          date > generated.txt
          git config user.name "User Name"
          git config user.email "user.email@domain.com"
          git add .
          git commit -m "My commit message"
          git push
```

However for repos that want to have traceability of commit ownership, and the security that comes with it, this approach won't suffice. Keep on reading...

## Signed

To sign commits on CI a few alternatives exist, but none of them is particularly trivial or has security disadvantages or involves some custom steps or 3rd party actions to setup. So lets describe the approaches on signing commits.

### Secret GPG keys

First at all, you need a private PGP key to be available in the CI environment. Using a personal PGP private key would imply exposing it as a repo secret, thus every maintainer (who has access to the workflow) could retrieve it to sign a commit and impersonate another developer or the CI bot. Creating a separate GitHub account would work but we would incur the extra cost as it was another developer seat in the team. Despite it's limitation this approach is follow by many many, and the following action seems like the popular GitHub action used.

- [crazy-max/ghaction-import-gpg](https://github.com/crazy-max/ghaction-import-gpg): unsafe option since uploaded keys can be seen by other developers with equal permissions.

### GitSign and GitSignStore

Gitstore setup a service to use ephemeral x509 keys, an alternative to GPG signing, along with SSH signing. This however recently, doesn't work anymore because GitHub removed Gitstore from their root of trust. Requests have been made to allow this service back, but no news yet.

This would also allow direct `git` command to be used to sign, without needs GitHub API calls.

### GitHub Action Bot

GitHub made a `github-action[bot]` that allows users to use only the GitHub REST or GraphQL APIs to make commits in CI. If the bot identity and the variable `secrets.GITHUB_TOKEN` (present in every workflow/job in GitHub) are used then GitHub will use their keys to sign the commit and tags.

This approach unfortunately requires the usage of APIs to commit and tag and `git` commands will **not work** directly.

Thus this approach requires the use of a library that implemented such APIs calls to sign the commits and tags or to roll our own scrips or actions todo these API calls.

Some actions libraries that do this currently. for commiting:

- [planetscale/ghcommit-action](https://www.github.com/planetscale/ghcommit-action): quite limited since does only commits but not tags and could have better defaults. fails on git-lfs and requires a git operation to be done before. :shrug:WTF:shrug:
- [verfiy-bot](https://github.com/IAreKyleW00t/verified-bot-commit): single developer, no community
- [qoomon/actions--create-commit](https://github.com/qoomon/actions--create-commit) single developer, no community, see [ref. 3](#ref)

for tagging:

- [mathieudutour/github-tag-action](https://github.com/mathieudutour/github-tag-action): used for tagging. fails on signed annotated tags. And this is due to a GitHub API limitation, see issue [ref. 7](#references).

for pull-requests:

- [peter-evans/create-pull-request](https://github.com/peter-evans/create-pull-request): focuses on creating a PR in the middle of the release flow, see [ref. 3](#references).

Has you can see many incomplete 3rd party actions exist, and not a nice unifying one has been found. There's however some shortcomings with GitHug action bot, when pushing to protected branches, to overcome this keep on reading.

#### GitHub App Bot

This approach is similar to the GitHub action bot, but allow pushes to protected branches and commits and tags to be authored with the bot identity. [Ref. 2](#references) covers most of the setup required. In this approach the created app id and token are the one used instead of `secrets.GITHUB_TOKEN`. So the actions from the previous group can be reused but a few more parameters need to be passed to the GitHub jobs.

# References

1. https://github.com/Nautilus-Cyberneering/pygithub/blob/main/docs/how_to_sign_automatic_commits_in_github_actions.md
2. https://github.com/orgs/community/discussions/50055
3. https://github.com/actions/runner/issues/667
4. https://www.chainguard.dev/unchained/keyless-git-commit-signing-with-gitsign-and-github-actions
5. https://tech.zarmory.com/2024/02/guarding-github-secrets-in-your.html
6. https://192dot.medium.com/sign-commit-using-github-actions-app-13488f6e76b7
7. https://github.com/orgs/community/discussions/4924
