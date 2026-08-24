# CI-workflow — ett manuelt steg gjenstår

`ci.yml` her er ferdig og skal ligge i `.github/workflows/ci.yml`. Den ble
liggende her fordi tokenet som pushet denne branchen ikke har `workflow`-scope,
og GitHub avviser da enhver push som oppretter eller endrer en workflow-fil.

## Ta den i bruk

```bash
mkdir -p .github/workflows
git mv docs/ci/ci.yml .github/workflows/ci.yml
git rm docs/ci/README.md
git commit -m "ci: kjør typecheck, lint, test og bygg på hver PR"
git push
```

Pushes dette fra en maskin med vanlig GitHub-innlogging, går det gjennom. Etterpå
kjører typecheck, lint, test og bygg på hver PR — de samme sjekkene som
`pnpm check` kjører lokalt.

Vurder samtidig å slå på branch protection på `master` med CI som påkrevd sjekk.
Uten det er workflowen en anbefaling, ikke en port.
