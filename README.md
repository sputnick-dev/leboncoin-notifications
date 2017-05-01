# leboncoin-notifier

Cet outil qui se veut simple et efficace, permet de vous notifier par mail avec une image et l'url des nouvelles ventes concernant une recherche precise via son url leboncoin.fr, a entrer en paramètre du script.

Si vous avez un compte free mobile, vous pouvez aussi avoir des notification via [SMS](http://www.domotique-info.fr/2014/06/nouvelle-api-sms-chez-free/).

A placer en [crontab](https://fr.wikipedia.org/wiki/Cron) toutes les heures par exemple.

# installation sous linux
-  mailx, curl, casperjs, phantomjs

http://docs.casperjs.org/en/latest/installation.html

Pour le mail, vérifier que la commande suivante fonctionne :

`echo test | mail -s test -a /chemin/vers/une/image.png mail@domain.tld`

# usage
`./leboncoin-notifier <leboncoin search url> <email> [free_sms_api_user] [free_sms_api_pass]`

