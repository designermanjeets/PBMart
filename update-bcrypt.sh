#!/bin/bash

# Find all JavaScript files that import bcrypt
grep -r "require('bcrypt')" --include="*.js" ./customer ./tenant

# Replace bcrypt with bcryptjs in all JavaScript files
find ./customer ./tenant -name "*.js" -exec sed -i 's/require(["\x27]bcrypt["\x27])/require("bcryptjs")/g' {} \; 