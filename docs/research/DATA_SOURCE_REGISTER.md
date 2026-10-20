# Public Data Source Register

- **Status:** P1 evaluation complete for reachability where noted. **No provider is activated in the product.**
- **Research baseline / retrieval date:** 2026-10-20.
- **Rule:** a listed provider is a candidate, not a confirmed integration. Public availability does not grant unlimited automated use or redistribution rights.
- **Integration sequencing:** the core MVP must not block on GIS. Start with at most one or two reliable read-only adapters when terms and behavior are verified.

## Technical verification results (2026-10-20)

| Provider                                    | Endpoint / document checked                                                                                            | Observed result                                                                                             | Assessment                                                                                                                          |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| U.S. Census Geocoder                        | `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=…&benchmark=Public_AR_Current&format=json` | HTTP `200`, JSON address match returned with coordinates and ZIP components.                                | Technically reachable. Requires a structured street address for address lookup. Terms/rate limits still `NOT VERIFIED`.             |
| FEMA NFHL GIS service                       | `https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer?f=json`                                           | HTTP `200`, service metadata (`currentVersion 11.1`), layer 28 `Flood Hazard Zones`, `maxRecordCount 2000`. | Technically reachable.                                                                                                              |
| FEMA NFHL point query                       | Layer 28 point query near New Orleans with `f=json`                                                                    | HTTP `200`, returned `FLD_ZONE: X` with `AREA WITH REDUCED FLOOD RISK DUE TO LEVEE`.                        | Works via `curl.exe`. PowerShell `Invoke-WebRequest` failed TLS negotiation in this environment.                                    |
| USGS 3DEP / EPQS                            | `https://epqs.nationalmap.gov/v1/json?x=-122.4194&y=37.7749&wkid=4326&units=Feet&includeDate=false`                    | HTTP `200`, JSON elevation value `54.1719` ft.                                                              | Service reachable. Docs URL `https://epqs.nationalmap.gov/v1/docs` previously returned HTTP `500`; treat documentation as unstable. |
| USGS Landslide Inventory and Susceptibility | Public tool page                                                                                                       | Page retrieved. No API or download tested.                                                                  | `NOT EVALUATED` for integration.                                                                                                    |
| USGS National Seismic Hazard Model          | Public program page                                                                                                    | Page retrieved. No API tested.                                                                              | `NOT EVALUATED` for integration.                                                                                                    |
| USITC HTS                                   | `https://hts.usitc.gov/` and archive list page                                                                         | Pages retrieved. No bulk download or database query tested.                                                 | `NOT EVALUATED` for integration.                                                                                                    |
| U.S. Bureau of Labor Statistics             | API FAQ page                                                                                                           | Page retrieved. No API call, key or limit test performed.                                                   | `NOT EVALUATED` for integration. Wages are not contractor installed prices.                                                         |
| Local building authority                    | Determined by jurisdiction                                                                                             | Not tested.                                                                                                 | `NOT EVALUATED`.                                                                                                                    |
| ICC model code text                         | <https://www.iccsafe.org/about/terms-of-use/>                                                                          | Terms page retrieved. Public viewing does not grant mirroring or redistribution rights.                     | Link-only. Never copy code text.                                                                                                    |

## Candidate source links from the specification

- <https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html>
- <https://msc.fema.gov/>
- <https://www.fema.gov/national-flood-hazard-layer-nfhl>
- <https://www.usgs.gov/tools/us-landslide-inventory-and-susceptibility-map>
- <https://www.usgs.gov/programs/earthquake-hazards/science/national-seismic-hazard-maps>
- <https://epqs.nationalmap.gov/v1/docs>
- <https://hts.usitc.gov/>
- <https://www.usitc.gov/harmonized_tariff_information/hts/archive/list>
- <https://www.bls.gov/developers/api_faqs.htm>
- <https://codes.iccsafe.org/>
- <https://www.iccsafe.org/about/terms-of-use/>

## Known boundaries that must appear in the product

- **Census:** structured address required for lookup; a matched point is interpolated, not survey grade; ZIP codes cross counties; geocode misses are possible.
- **FEMA NFHL:** effective-map coverage varies; a map match or miss is not a parcel determination, insurance rating or proof of no flood risk.
- **USGS landslide/seismic:** modeled/regional data only; not geotechnical or code-design evaluation.
- **EPQS:** single-point elevation does not describe parcel slope, excavation volumes, truck approach or access.
- **USITC HTS:** not an automatic duty calculator; classification, origin and effective dates require specialist verification.
- **BLS:** published wage context only, not an installed contractor labor price.
- **Local authority:** code edition and amendments must be verified; no instant compliance opinion.
- **ICC:** link to official references; do not mirror or redistribute copyrighted code text.

## Required behavior before activation (REQ-320, REQ-321, REQ-322)

- Read-only, bounded and modular adapters behind a provider interface.
- Timeouts, retry only for transient errors, circuit breaker and explicit fallback.
- Version-aware parsing and contract tests.
- Every observation records: `source_name`, `source_url`, `version_or_date`, `retrieved_at`, `input_geometry_precision`, `geographic_resolution`, `coverage_status`, `license_or_use_note`, `observation`, `status`, optional `cost_adjustment_justification`, `limitations`, `customer_action`.
- `NOT FOUND`, `SERVICE UNAVAILABLE`, `OUTSIDE COVERAGE`, `NOT ASSESSED` and `NO RISK` must be distinct.
- No false parcel, compliance or installed-cost claims. These feeds never produce localized cost data.

## Recommended order

1. **Census structured-address geocoding** — highest utility for county/geography resolution; verify terms and add contract tests.
2. **FEMA NFHL link or documented query** — high perceived value, but keep to screening language and show map effective date.
3. **USGS hazard links first, API later** — link to official maps without pretending to assess a parcel.
4. **USITC/BLS reference links only** — do not compute tariffs or labor rates in the MVP.
5. **Do not wait for any of these to ship the core quote-comparison MVP.**

## Traceability

- REQ-320, REQ-321, REQ-322, REQ-323; master prompt section 8.
