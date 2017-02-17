<?php

namespace Dive\APIBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Dive\APIBundle\Entity\DataEntity;
use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;

/**
* @Route("/vu/api/v2")
*/

class VUDataController extends BaseController
{

  var $dataSet = 1;
    /**
     * Returns DIVE entities, based on a keywords
     * @Route("/search")
     */
    public function searchAction()
    {
      // start time measurement
      $timeStart = microtime(true);

      $this->saveSession();
      // get search data
      $searchData = $this->getSearchData('search');

      // end time measurement
      $timeEnd = microtime(true);

      // return data
      return $this->dataResponse(array(
        'took' => $timeEnd - $timeStart,
        'query'=> $searchData['query'],
        'fromCache'=>$searchData['fromCache'],
        ), $searchData['data'], $searchData['key']);
    }


  /**
   *  Returns DIVE entities, based on a set of ids
     * @Route("/searchids")
     */
  public function searchIdsAction()
  {
      // start time measurement
    $timeStart = microtime(true);

      // get search data
    $searchData = $this->getSearchData('searchids');

      // end time measurement
    $timeEnd = microtime(true);

      // return data
    return $this->dataResponse(array(
      'took' => $timeEnd - $timeStart,
      'query'=> $searchData['query'],
      'fromCache'=>$searchData['fromCache'],
      ), $searchData['data'], $searchData['key']);
  }


  // creates search query from keywordlist, offset and limit

  private function getSearchQuery($keywordsList, $offset, $limit){
        // create query
   $query = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
   PREFIX dive: <http://purl.org/collections/nl/dive/>
   PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
   PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>
   PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
   SELECT DISTINCT ?entity ?type (SAMPLE(?asource) AS ?source) (SAMPLE(?aplaceholder) AS ?placeholder) (SAMPLE(?alabel) as ?label) (SAMPLE(?atimestamp) as ?timestamp) (SAMPLE(?adbpediaType) AS ?dbpediaType) WHERE {
    {
      OPTIONAL { ?entity rdfs:label ?alabel. }
      OPTIONAL { ?entity dc:description ?adescription.}
      ' . $keywordsList . '
      ?entity rdf:type ?type.
      FILTER(?type=sem:Actor || ?type = sem:Place || ?type = sem:Event || ?type = dive:Person || ?type = skos:Concept)
      OPTIONAL { ?entity dive:depictedBy ?depict. ?depict dive:source ?asource. ?depict dive:placeholder ?aplaceholder. }
      OPTIONAL { ?entity dive:hasTimeStamp ?atimestamp }
      OPTIONAL { ?entity dive:dbpediaType ?adbpediatype }
    }
    UNION{
      OPTIONAL { ?entity rdfs:label ?alabel. }
      OPTIONAL { ?entity dc:description|dcterms:abstract|dcterms:description ?adescription.}
      '.$keywordsList.'
      ?entity rdf:type ?type.
      FILTER(?type = dive:MediaObject)
      ?entity dive:source ?asource. ?entity dive:placeholder ?aplaceholder.
      OPTIONAL { ?entity dive:hasTimeStamp ?atimestamp }
      OPTIONAL { ?entity dive:dbpediaType ?adbpediatype }
    }
  }
  GROUP BY ?entity ?type OFFSET '.$offset.' LIMIT ' . $limit;
  return $query;
}

  // convert rawdata to dive entities

private function createDataEntity($rawData){
  $dataEntity = new DataEntity();

  // create and fill entity
  $dataEntity
  ->setUid(isset($rawData->entity) ? $rawData->entity->value : 'no-id')
  ->setType(isset($rawData->type) ? $rawData->type->value : 'no-type',true)
  ->setTitle(isset($rawData->label) ? $rawData->label->value : 'no-title')
  ->setDescription(isset($rawData->description) ? $rawData->description->value : 'no-description')

  ->setDepictedBySource(isset($rawData->source) ? $rawData->source->value : '')
  ->setDepictedByPlaceHolder(isset($rawData->placeholder) ? $rawData->placeholder->value : '')

  ->setDateStart(isset($rawData->timestamp) ? $rawData->timestamp->value : '')
  ->setDateEnd('')

  ->setEvent(isset($rawData->event) ? $rawData->event->value : '');

  // convert dbpedia persons actors to person entities (should be managed in database)
  if($dataEntity->getType() =='Actor'){
    if( $dataEntity->getDBPedia() && (strpos('person',  $dataEntity->getDBPedia()) > -1 || strpos('people', $dataEntity->getDBPedia()) > -1 )){
      $dataEntity->setType('Person');
    } else{
      $dataEntity->setType('Concept');
    }
  }
    // empty depicted_by if not an Event or MediaObject
  if ($dataEntity->getType() != 'Event' && $dataEntity->getType() !='MediaObject'){
    $dataEntity->setDepictedByPlaceHolder('');///search/images/' + urlencode(preg_replace("/[^[:alnum:][:space:]]/ui", '',$dataEntity->getTitle())) + '.jpg');
    $dataEntity->setDepictedBySource('');//'/search/images/' + urlencode(preg_replace("/[^[:alnum:][:space:]]/ui", '',$dataEntity->getTitle())) + '.jpg');
}
return $dataEntity;
}

  // get search data

private function encodeId($uid){
  $pos = strrpos($uid, "/");
  if ($pos) {
    $entityId = substr($uid,$pos+1);

    // only decode entity id if it's not yet encoded!
    if (urldecode($entityId) == $entityId){
      $entityId = urlencode($entityId);
    }

    $uid = substr($uid,0,$pos+1) . $entityId;
  }
  return $uid;
}

  // get search data

private function getSearchData($type){

      // get parameters
  $keywords = $this->getRequest()->get('keywords','');
  $offset = intval($this->getRequest()->get('offset',0));
  $limit = intval($this->getRequest()->get('limit',850));
  $key = sha1($keywords.$offset.$limit);

      // get data from cache
  $data = $this->getCachedQuery($type,$key);
  $fromCache = true;

  $keywordsList = '';

  switch($type){
    case 'search':

      // make keywords list
    $keywords = explode(' ', $keywords);

    foreach($keywords as $k){
      $searchStr = $k;
      $exclude = '';
      if (substr($k,0,1) == '-'){
        $searchStr = substr($k,1);
        $exclude = '! ';
      }
      $keywordsList .= ' FILTER ('.$exclude.'(CONTAINS(lcase(str(?alabel)), "'. addslashes(strtolower($searchStr)).'") || CONTAINS(lcase(str(?adescription)), "'. addslashes(strtolower($searchStr)).'")))';
    }
    break;
    case 'searchids':

    $keywords = explode(' ', $keywords);

        $keywordsList = 'FILTER('; // )
        $keywordsCount = 0;
        foreach($keywords as $k){
          if ($k != ''){
            if ($keywordsList != 'FILTER('){
              $keywordsList .= ' || ';
            }
            $keywordsCount++;
            $keywordsList .= '?entity = <'. addslashes($k).'>';
          }
        }
        /* (*/   $keywordsList .= ')';
        // if no keywords or ids specificied return immediately
        if ($keywordsCount == 0){
          return false;
        }
        break;
      }
     // create query
      $query = $this->getSearchQuery($keywordsList, $offset, $limit);
      // check if query should be dumped
      $this->checkDumpQuery($query);

      if (!$data){

    // if no data from cache was found, get query from server

        $fromCache = false;
        $data = json_encode($this->convertToDiveData($this->getQuery($query)));
          // store result in cache
        $this->setCachedQuery($type, $key, $data);
      }


      return array(
        'query'=>$query,
        'data'=>$data,
        'fromCache' => $fromCache,
        'key'=>$key
        );
    }


    public function convertToDiveData($data){
     $json = json_decode($data);
     $diveData = array();

      // json succeeded
     if (json_last_error() == 0 && isset($json->results) && isset($json->results->bindings)) {
        // loop al bindings
      $ids = array();
      for ($i =0, $len = count($json->results->bindings); $i<$len; $i++){
        $result = $this->createDataEntity($json->results->bindings[$i]);
        if (!array_key_exists($result->getUID(), $ids)){
          $diveData[] = $result;
          $ids[$result->getUID()] = true;
        }
      }
    }
    return $diveData;
  }

   /**
    * Returns DIVE entity details, based on a entity id
     * @Route("/entity/details")
     */
   public function detailsAction()
   {
    // start time measurement
    $timeStart = microtime(true);

    $this->saveSession();

    // get parameters
    $id = $this->encodeId(($this->getRequest()->get('id',0)));
    $key = sha1($id);

    // get data from cache
    $data = $this->getCachedQuery('details',$key);
    $fromCache = true;

    // create query
    $query = 'PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>
    PREFIX dive: <http://purl.org/collections/nl/dive/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT DISTINCT ?label ?description ?link ?timestamp ?type (SAMPLE(?adbpediatype) AS ?dbpediatype) (SAMPLE(?aplaceholder) AS ?placeholder) (SAMPLE(?asource) AS ?source) WHERE {
     <'.$id.'> rdfs:label ?label.
     <'.$id.'> rdf:type ?type.
     FILTER(?type=sem:Actor || ?type = sem:Place || ?type = sem:Event || ?type = dive:Person || ?type = skos:Concept || ?type=dive:MediaObject)
     OPTIONAL { <'.$id.'> dc:description|dcterms:abstract|dcterms:description ?description. }
     OPTIONAL { <'.$id.'> dive:hasExternalLink ?link. FILTER(str(?link) != "") }
     OPTIONAL { <'.$id.'> dive:depictedBy ?adepict. ?adepict dive:source ?asource. ?adepict dive:placeholder ?aplaceholder.}
     OPTIONAL { <'.$id.'> dive:source ?asource. ?entity dive:placeholder ?aplaceholder.}
     OPTIONAL { <'.$id.'> rdf:type sem:Event. <'.$id.'> dive:hasTimeStamp ?timestamp }
     OPTIONAL { <'.$id.'> dive:dbpediaType ?adbpediatype }
   } GROUP BY ?label ?description ?link ?timestamp ?type LIMIT 1';

  // check if query should be dumped
   $this->checkDumpQuery($query);

   if (!$data){
    $fromCache = false;
    $data = $this->convertToDiveData($this->getQuery($query));
    if ($data){
      $data[0]->setUid($id);
    }
    $data = json_encode($data);
    $this->setCachedQuery('details', $key, $data);
  }
  $timeEnd = microtime(true);




  return $this->dataResponse(array(
   'took' => $timeEnd - $timeStart,
   'query'=> $query,
   'fromCache'=>$fromCache
   ), $data, $key);

}


   /**
     * Returns DIVE entities related to entity with entityId id
     * @Route("/entity/related")
     */
   public function relatedAction()
   {
    // start time measurement
    $timeStart = microtime(true);

    $this->saveSession();

    // get parameters
    $id = $this->encodeId($this->getRequest()->get('id',0));
    $offset = intval($this->getRequest()->get('offset',0));
    $limit = intval($this->getRequest()->get('limit',850));
    $key = sha1($id.$offset.$limit);

    // get data from cache
    $data = $this->getCachedQuery('related',$key);


    $fromCache = true;


    // create query
    $query = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>
    PREFIX dive: <http://purl.org/collections/nl/dive/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    SELECT DISTINCT ?entity ?type (SAMPLE(?aevent) AS ?event) (SAMPLE(?asource) AS ?source) (SAMPLE(?aplaceholder) AS ?placeholder) (SAMPLE(?alabel) as ?label) (SAMPLE(?atimestamp) as ?timestamp) (SAMPLE(?adbpediaType) AS ?dbpediaType)
    WHERE {
      {
        { SELECT DISTINCT ?entity ?aevent WHERE {
          { <'.$id.'> (owl:sameAs*|^owl:sameAs*) ?same.
          ?same (dive:isRelatedTo|^dive:isRelatedTo) ?entity.
        } UNION{
          <'.$id.'> (dive:isRelatedTo|^dive:isRelatedTo) ?entity.
        } UNION{
          <'.$id.'> (dive:depictedBy|^dive:depictedBy) ?entity.
        } UNION{
          <'.$id.'> (dive:isRelatedTo|^dive:isRelatedTo) ?aevent.
          ?aevent rdf:type sem:Event.
          ?aevent (dive:isRelatedTo|^dive:isRelatedTo) ?entity.
        } UNION{
          <'.$id.'> (owl:sameAs*|^owl:sameAs*) ?same.
          ?same (dive:isRelatedTo|^dive:isRelatedTo) ?aevent.
          ?aevent rdf:type sem:Event.
          ?aevent (dive:isRelatedTo|^dive:isRelatedTo) ?entity.
        }
      } GROUP BY ?entity ?aevent
    }
    FILTER(?entity != <'.$id.'>)
    ?entity rdf:type ?type.
    FILTER(?type=sem:Actor || ?type = sem:Place || ?type = sem:Event || ?type = dive:Person || ?type = skos:Concept || ?type=dive:MediaObject)
    OPTIONAL { ?entity rdfs:label ?alabel. }
    OPTIONAL { ?entity dive:depictedBy ?adepict. ?adepict dive:source ?asource. ?adepict dive:placeholder ?aplaceholder.}
    OPTIONAL { ?entity dive:source ?asource. ?entity dive:placeholder ?aplaceholder.}
    OPTIONAL { ?entity dive:hasTimeStamp ?atimestamp }
    OPTIONAL { ?entity dive:dbpediaType ?adbpediatype }
  }
}
GROUP BY ?entity ?type
ORDER BY ASC(?event) ASC(?timestamp) OFFSET '.$offset.' LIMIT '. $limit;

// check if query should be dumped
$this->checkDumpQuery($query);



if (!$data){
// get data

  $fromCache = false;
  $data = json_encode($this->convertToDiveData($this->getQuery($query)));
  $this->setCachedQuery('related', $key, $data);
}

$timeEnd = microtime(true);

if ($this->getRequest()->get('showQuery',false)){
 echo $query . "\n\n";
}

return $this->dataResponse(array(
 'took' => $timeEnd - $timeStart,
 'query'=> $query,
 ), $data,$key);
}


 // get a query
  public function getQuery($query, $entailment = 'rdfslite'){
    $databaseHost = $this->container->getParameter('dive_database_host');
    $url = $databaseHost . '?format=json&entailment='.$entailment.'&query=' . urlencode($query);
    return $this->getCurl($url);
  }




   /**
     * @Route("/cache/flush/yesiamsure")
     */
   public function cacheFlushAction()
   {
     die('Deprecated call, please use the command line to clear the cache!');
  }






  public function checkDumpQuery($query){
    if ($this->getRequest()->get('dump',false) == 'query'){
      echo '<pre>';
      echo htmlentities($query);
      echo '</pre>';
      die();
    }

  }

}
