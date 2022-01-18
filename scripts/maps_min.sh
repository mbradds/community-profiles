#!/bin/bash
simplify_base_pct=100
simplify_prs=0.0001

cd src/company_data
ignore="community_profiles/"
for d in */ ; do
    if [ "$d" != "$ignore" ]; then 
        mapshaper -i ${d}poly1.json -proj EPSG:4269 -simplify $simplify_base_pct% keep-shapes -o ${d}poly1_min.json precision=$simplify_prs
    fi
done
