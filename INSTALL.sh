#!/usr/bin/env bash

# Script to update the timeline website automatically
if [ "x$PATH" == "x" ]; then
    export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin"
fi

# die if there is an error
set -e 

destination="/var/www/html/hopemanhistory"
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
script_filename="$(basename "${BASH_SOURCE[0]}")"
date=$(date "+%A %d %B %Y %H:%M")

cd "$script_dir"
/usr/bin/git pull
[ ! -d "build" ] && mkdir build
cp -R website/* build/
sed -i "s/{{LAST_UPDATED}}/$date/g" build/index.html

[ -n "$destination" -a -d "$destination" ] && rsync -rvh "build/" "$destination/" --delete