![App](http://dive.frontwise.com/apple-touch-icon.png)

DIVE
=====================

DIVE is a linked-data digital cultural heritage collection browser. It was developed to provide innovative access to heritage objects from heterogeneous collections, using historical events and narratives as the context for searching, browsing and presenting of individual and group of objects.

![Screens](https://frontwise.com/uploads/DIVE/Devices.png)


Installation instructions
=========================

Installation follows standard symfony2 application deployment: http://symfony.com/doc/current/cookbook/deployment/tools.html

* Install and configure a webserver (Apache, Nginx) with MySql and PHP
* Install extra required PHP modules: `php-curl php-gd php-intl`
* Put this code on the server.
* Run `php app/check.php` in the project root directory to make sure you meet requirements, fix as neccesary.
* Install dependencies:
    * Install composer: https://getcomposer.org/
    * Run `composer install` in the project root directory.
* Fix file permissions
    * `app/logs`, `app/cache`, `web/cache` should be writable by the web server (apache)
* Make sure the web server serves ONLY the `web` directory of the project. Doing otherwise is a security risk.
* Setup the database
    * Create a database for the project (mysql is tested)
    * Enter connection details into `app/config/parameters.yml`, clear `app/cache` directory afterwards.
    * run `php app/console doctrine:schema:update --force --no-debug` in the project root to create all tables.
* Install assets
  * run `php app/console assets:install --symlink` in the project root to install assets with symlinks.
  * run `php app/console assetic:watch` in the project root to compile and monitor assets.

Create a custom API
=========================

To add a custom API for your dataset EXAMPLE, complete the following steps:

* Add your dataset to the datasets lists in `app/parameters.yml`.
* Create a new controller `APIBundle:EXAMPLEController` that extends `APIBundle:BaseController`
	* Make EXAMPLE the controller wide route preset
	* Set `$dataSet` to a free number (used for the cache)
	* Implement actions for [A] /search, [A]/searchids, [A]/entity/related and [B] /entity/details
	* Return JSON data in the specified DIVE entity format A or B

Use `APIBundle:VUDataController` as an example.


API return data
=========================

A. Search/SearchIds/Related entities:

GET: `/vu/api/v2/entity/related?id=http%3A%2F%2Fpurl.org%2Fcollections%2Fnl%2Fdive%2Fentity%2Fkb-loc-Vredes&offset=0&limit=1600`

```json
{
  "meta": {
    "took": 0.32813405990601,
    "query": "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n    PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>\n    PREFIX dive: <http://purl.org/collections/nl/dive/>\n    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\n    SELECT DISTINCT ?entity ?type (SAMPLE(?aevent) AS ?event) (SAMPLE(?asource) AS ?source) (SAMPLE(?aplaceholder) AS ?placeholder) (SAMPLE(?alabel) as ?label) (SAMPLE(?atimestamp) as ?timestamp) (SAMPLE(?adbpediaType) AS ?dbpediaType)\n    WHERE {\n      {\n        { SELECT DISTINCT ?entity ?aevent WHERE {\n          { <http://purl.org/collections/nl/dive/entity/kb-loc-Vredes> (owl:sameAs*|^owl:sameAs*) ?same.\n          ?same (dive:isRelatedTo|^dive:isRelatedTo) ?entity.\n        } UNION{\n          <http://purl.org/collections/nl/dive/entity/kb-loc-Vredes> (dive:isRelatedTo|^dive:isRelatedTo) ?entity.\n        } UNION{\n          <http://purl.org/collections/nl/dive/entity/kb-loc-Vredes> (dive:depictedBy|^dive:depictedBy) ?entity.\n        } UNION{\n          <http://purl.org/collections/nl/dive/entity/kb-loc-Vredes> (dive:isRelatedTo|^dive:isRelatedTo) ?aevent.\n          ?aevent rdf:type sem:Event.\n          ?aevent (dive:isRelatedTo|^dive:isRelatedTo) ?entity.\n        } UNION{\n          <http://purl.org/collections/nl/dive/entity/kb-loc-Vredes> (owl:sameAs*|^owl:sameAs*) ?same.\n          ?same (dive:isRelatedTo|^dive:isRelatedTo) ?aevent.\n          ?aevent rdf:type sem:Event.\n          ?aevent (dive:isRelatedTo|^dive:isRelatedTo) ?entity.\n        }\n      } GROUP BY ?entity ?aevent\n    }\n    FILTER(?entity != <http://purl.org/collections/nl/dive/entity/kb-loc-Vredes>)\n    ?entity rdf:type ?type.\n    FILTER(?type=sem:Actor || ?type = sem:Place || ?type = sem:Event || ?type = dive:Person || ?type = skos:Concept || ?type=dive:MediaObject)\n    OPTIONAL { ?entity rdfs:label ?alabel. }\n    OPTIONAL { ?entity dive:depictedBy ?adepict. ?adepict dive:source ?asource. ?adepict dive:placeholder ?aplaceholder.}\n    OPTIONAL { ?entity dive:source ?asource. ?entity dive:placeholder ?aplaceholder.}\n    OPTIONAL { ?entity dive:hasTimeStamp ?atimestamp }\n    OPTIONAL { ?entity dive:dbpediaType ?adbpediatype }\n  }\n}\nGROUP BY ?entity ?type\nORDER BY ASC(?event) ASC(?timestamp) OFFSET 0 LIMIT 1600"
  },
  "data": [
    {
      "uid": "http://purl.org/collections/nl/dive/ANP+Nieuwsbericht+-+27-12-1974+-+74",
      "type": "MediaObject",
      "title": "ANP Nieuwsbericht - 27-12-1974 - 74",
      "description": "no-description",
      "date": {
        "start": "",
        "end": ""
      },
      "depicted_by": {
        "placeholder": "http://imageviewer.kb.nl/ImagingService/imagingService?id=http://resources51.kb.nl/anp/data/1974/1974_12/jpeg/anp_1974-12-27_74_access.jpg&zoom=0.20&useresolver=false",
        "source": "http://resolver.kb.nl/resolve?urn=anp:1974:12:27:74:mpeg21"
      },
      "event": "",
      "dbpedia": []
    },
    {
      "uid": "http://purl.org/collections/nl/dive/entity/evt-ANP+Nieuwsbericht+-+27-12-1974+-+74",
      "type": "Event",
      "title": "ANP Nieuwsbericht - 27-12-1974 - 74",
      "description": "no-description",
      "date": {
        "start": "1974/12/27 00:00:00",
        "end": ""
      },
      "depicted_by": {
        "placeholder": "http://imageviewer.kb.nl/ImagingService/imagingService?id=http://resources51.kb.nl/anp/data/1974/1974_12/jpeg/anp_1974-12-27_74_access.jpg&zoom=0.20&useresolver=false",
        "source": "http://resolver.kb.nl/resolve?urn=anp:1974:12:27:74:mpeg21"
      },
      "event": "",
      "dbpedia": []
    },
    {
      "uid": "http://purl.org/collections/nl/dive/entity/kb-loc-Den+Haag",
      "type": "Place",
      "title": "Den Haag",
      "description": "no-description",
      "date": {
        "start": "",
        "end": ""
      },
      "depicted_by": {
        "placeholder": "",
        "source": ""
      },
      "event": "http://purl.org/collections/nl/dive/entity/evt-ANP+Nieuwsbericht+-+27-12-1974+-+74",
      "dbpedia": []
    },
    {
      "uid": "http://purl.org/collections/nl/dive/entity/kb-loc-Vredespaleis",
      "type": "Place",
      "title": "Vredespaleis",
      "description": "no-description",
      "date": {
        "start": "",
        "end": ""
      },
      "depicted_by": {
        "placeholder": "",
        "source": ""
      },
      "event": "http://purl.org/collections/nl/dive/entity/evt-ANP+Nieuwsbericht+-+27-12-1974+-+74",
      "dbpedia": []
    }
  ]
}
```

B. Details:

GET: `/vu/api/v2/entity/details?id=http%3A%2F%2Fpurl.org%2Fcollections%2Fnl%2Fdive%2Fentity%2Fkb-loc-Den%2BHaag`

```json
{
  "meta": {
    "took": 0.0045819282531738,
    "query": "PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>\n    PREFIX dive: <http://purl.org/collections/nl/dive/>\n    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n    SELECT DISTINCT ?label ?description ?link ?timestamp ?type (SAMPLE(?adbpediatype) AS ?dbpediatype) (SAMPLE(?aplaceholder) AS ?placeholder) (SAMPLE(?asource) AS ?source) WHERE {\n     <http://purl.org/collections/nl/dive/entity/kb-loc-Den+Haag> rdfs:label ?label.\n     <http://purl.org/collections/nl/dive/entity/kb-loc-Den+Haag> rdf:type ?type.\n     FILTER(?type=sem:Actor || ?type = sem:Place || ?type = sem:Event || ?type = dive:Person || ?type = skos:Concept || ?type=dive:MediaObject)\n     OPTIONAL { <http://purl.org/collections/nl/dive/entity/kb-loc-Den+Haag> dc:description|dcterms:abstract|dcterms:description ?description. }\n     OPTIONAL { <http://purl.org/collections/nl/dive/entity/kb-loc-Den+Haag> dive:hasExternalLink ?link. FILTER(str(?link) != \"\") }\n     OPTIONAL { <http://purl.org/collections/nl/dive/entity/kb-loc-Den+Haag> dive:depictedBy ?adepict. ?adepict dive:source ?asource. ?adepict dive:placeholder ?aplaceholder.}\n     OPTIONAL { <http://purl.org/collections/nl/dive/entity/kb-loc-Den+Haag> dive:source ?asource. ?entity dive:placeholder ?aplaceholder.}\n     OPTIONAL { <http://purl.org/collections/nl/dive/entity/kb-loc-Den+Haag> rdf:type sem:Event. <http://purl.org/collections/nl/dive/entity/kb-loc-Den+Haag> dive:hasTimeStamp ?timestamp }\n     OPTIONAL { <http://purl.org/collections/nl/dive/entity/kb-loc-Den+Haag> dive:dbpediaType ?adbpediatype }\n   } GROUP BY ?label ?description ?link ?timestamp ?type LIMIT 1",
    "fromCache": true
  },
  "data": [
    {
      "uid": "http://purl.org/collections/nl/dive/entity/kb-loc-Den+Haag",
      "type": "Place",
      "title": "Den Haag",
      "description": "no-description",
      "date": {
        "start": "",
        "end": ""
      },
      "depicted_by": {
        "placeholder": "",
        "source": ""
      },
      "event": "",
      "dbpedia": []
    }
  ]
}
```
