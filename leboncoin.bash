#!/bin/bash

search_url="$1"
base_dir=$2
default_mail=$3
free_sms_api_user=$4
free_sms_api_pass=$5
mail_title="leboncoin notifier"

if [[ ! -d $2 ]]; then
    echo >&2 "$0 <url> <casperjs directory> [free_sms_api_user] [free_sms_api_pass]"
    exit 1
fi

shopt -s nullglob

# makes some randomness when used in crontab
if [[ ! -t 0 ]]; then
    intrandfromrange() { echo $(( ( RANDOM % ($2 - $1 +1 ) ) + $1 )); }
    sleep $(intrandfromrange 1 1200)
fi

rm -f /tmp/lbc_[0-9a-fA-F]*_.png

cd "$base_dir"

# if there's some fresh links, the caspersjs script will create images matching /tmp/lbc_[0-9]*.png
casperjs leboncoin-alerter.js --url="$search_url" "$@"

for image in /tmp/lbc_[0-9a-fA-F]*_.png; do
    b64=$(awk -F_ '{print $2}' <<< "$image")
    url=$(base64 -d <<< "$b64")
    if [[ -s $image ]]; then
        echo "$url" |
            # send email with captured image + link
            mail -v -a "$image" -s "$mail_title" $default_mail
            # send sms with free SMS API if this argument is provided
            [[ $free_sms_api_pass ]] && curl -v "https://smsapi.free-mobile.fr/sendmsg?user=$free_sms_api_user&pass=$free_sms_api_pass&msg=check%20email%20for%20leboncoin%20alerter"
    fi
done
