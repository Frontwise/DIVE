<?php

namespace Dive\APIBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Dive\APIBundle\Entity\DataEntity;

/**
* @Route("/europeana/api/v2")
*/

class EuropeanaDataController extends BaseController
{

  var $dataSet = 2;
    /**
     * @Route("/search")
     */
    public function searchAction()
    {
      // start time measurement
      $timeStart = microtime(true);

      // get search data
      $searchData = $this->getSearchData('search');

      // end time measurement
      $timeEnd = microtime(true);

      // return data
      return $this->dataResponse(array(
        'took' => $timeEnd - $timeStart,
        'query'=> $searchData['query'],
        'fromCache'=>$searchData['fromCache']
        ), $searchData['data'], $searchData['key']);
    }


  /**
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
      ), $searchData['data'],$searchData['key']);
  }

  private function getDiveType($type){
    switch($type){
      case 'IMAGE': return 'MediaObject'; break;
      default:
      return 'Concept';
      break;
    }
  }
// convert rawdata from search to dive entity

  private function createDataEntity($rawData){
    $dataEntity = new DataEntity();
    $dataEntity
    ->setUid(isset($rawData->id) ? $rawData->id : (isset($rawData->about) ? $rawData->about : 'no-id'))
    ->setType(isset($rawData->type) ? $this->getDiveType($rawData->type) : 'no-type')
    ->setTitle(isset($rawData->title) && count($rawData->title) > 0 ? $rawData->title[0] : (isset($rawData->proxies) && isset($rawData->proxies->dcTitle) ? reset($rawData->proxies->dcTitle) : 'no-title'))
    ->setDescription(isset($rawData->dataProvider) ? $rawData->dataProvider : 'no-description')

    ->setDepictedBySource(isset($rawData->edmPreview) && count($rawData->edmPreview) > 0 ? $this->rewriteImage($rawData->edmPreview[0],1200) : '')
    ->setDepictedByPlaceHolder(isset($rawData->edmPreview) && count($rawData->edmPreview) > 0 ? $this->rewriteImage($rawData->edmPreview[0],400) : '')

    ->setDateStart('')
    ->setDateEnd('');
    return $dataEntity;
  }


  private function createSearchUrl($keywords){
    return 'http://europeana.eu/api/v2/search.json?wskey='.$this->container->getParameter('europeana_api_key').'&query='.urlencode($keywords).'&start=1&rows=999&profile=minimal';
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
      break;
      case 'searchids':
      break;
    }

    // if no data from cache was found, get query from server
    if (!$data){
      $fromCache = false;
      $url = $this->createSearchUrl($keywords);
      $data = json_encode($this->convertSearchToDiveData($this->getCurl($url)));
          // store result in cache
      $this->setCachedQuery($type, $key, $data);
    }


    return array(
      'query'=>'Search call to Europeana API',
      'data'=>$data,
      'fromCache' => $fromCache,
      'key'=>$key
      );
  }


  public function convertSearchToDiveData($data){
   $json = json_decode($data);

   $diveData = array();

      // json succeeded
   if (json_last_error() == 0 && isset($json->success) && isset($json->items)) {
        // loop al bindings
    for ($i =0, $len = count($json->items); $i<$len; $i++){
      $diveData[] = $this->createDataEntity($json->items[$i]);
    }
  }
  return $diveData;
}

   /**
     * @Route("/entity/details")
     */
   public function detailsAction()
   {
    // start time measurement
    $timeStart = microtime(true);

    // get parameters
    $id = $this->encodeId(($this->getRequest()->get('id',0)));
    $key = sha1($id);

    // get data from cache
    $data = $this->getCachedQuery('details',$key);
    $fromCache = true;

    if (!$data){
      $fromCache = false;
      $url = $this->createDetailsUrl($id);
      $data = json_encode($this->convertDetailsToDiveData($this->getCurl($url)));
      $this->setCachedQuery('details', $key, $data);
    }
    $timeEnd = microtime(true);

    return $this->dataResponse(array(
     'took' => $timeEnd - $timeStart,
     'query'=> 'Record/full call to Europeana API',
     'fromCache'=>$fromCache
     ), $data,$key);

  }

  public function convertDetailsToDiveData($data){
   $json = json_decode($data);
   $diveData = array();
  // json succeeded
   if (json_last_error() == 0 && isset($json->success) && isset($json->object)) {
    $diveData[] = $this->createDataEntity($json->object);
  }

  return $diveData;
}

private function createDetailsUrl($id){
  return 'http://europeana.eu/api/v2/record/'.$id.'.json?wskey='.$this->container->getParameter('europeana_api_key').'&profile=full';
}

private function createRelatedUrl($id){
  return 'http://europeana.eu/api/v2/record/'.$id.'.json?wskey='.$this->container->getParameter('europeana_api_key').'&profile=similar';
}


public function convertRelatedToDiveData($data){
 $json = json_decode($data);
 $diveData = array();

      // json succeeded
 if (json_last_error() == 0 && isset($json->success) && isset($json->similarItems)) {
        // loop al bindings
  for ($i =0, $len = count($json->similarItems); $i<$len; $i++){
    $diveData[] = $this->createDataEntity($json->similarItems[$i]);
  }
}
return $diveData;
}

private function rewriteImage($url, $size){
  // memorix
  $checkUrl = strtolower($url);
  if (strpos($checkUrl,'memorix') > -1)  { return str_replace('150x150',$size.'x'.$size, $url); }
  // http://europeanastatic.eu/api/image?uri=http%3A%2F%2Fsearchassets.nai.nl%2Fimage%2FCIS%2Fbasic%2FBLOM_n286-240.jpg&size=LARGE&type=IMAGE
  if (false && $size > 400 && strpos($checkUrl,'searchassets.nai.nl') > -1)  {
    return urldecode(str_replace(['http://europeanastatic.eu/api/image?uri=','&size=LARGE&type=IMAGE','&size=large&type=image'],'',$checkUrl));
  }
  return $url;
}



private function encodeId($uid){
  // no encoding/changes yet
  return $uid;
}

   /**
     * @Route("/entity/related")
     */
   public function relatedAction()
   {
    // start time measurement
    $timeStart = microtime(true);

    // get parameters
    $id = $this->encodeId($this->getRequest()->get('id',0));
    $offset = intval($this->getRequest()->get('offset',0));
    $limit = intval($this->getRequest()->get('limit',850));
    $key = sha1($id.$offset.$limit);

    // get data from cache
    $data = $this->getCachedQuery('search',$key);
    $fromCache = true;
    if (!$data){
      $fromCache = false;
      $url = $this->createRelatedUrl($id);
      $data = json_encode($this->convertRelatedToDiveData($this->getCurl($url)));
      // get data
      $this->setCachedQuery('related', $key, $data);
    }

    $timeEnd = microtime(true);

    return $this->dataResponse(array(
     'took' => $timeEnd - $timeStart,
     'query'=> 'Record/similar call to Europeana API',
     ), $data, $key);
  }



  public function storeQuery($query){
    file_put_contents('/tmp/dive-query.txt', str_replace('  ',' ', trim(preg_replace('/\t+/', '', $query))));
  }

   /**
     * @Route("/cache/flush/yesiamsure")
     */
   public function cacheFlushAction()
   {
     $cached = $this->getRepo('QueryCache')->findBy(array('dataSet'=>$this->dataSet));
     $manager = $this->getDoctrine()->getManager();
     if ($cached)
     {
      foreach($cached as $c){
        $manager->remove($c);
      }
    }
    $manager->flush();
    die('Query cache flushed!');
  }





   /**
     * @Route("/entity/relatedness")
     */
   public function relatednessAction()
   {
    $timeStart = microtime(true);
    $id1 = addslashes($this->getRequest()->get('id1',0));
    $id2 = addslashes($this->getRequest()->get('id2',0));
    $key = sha1($id1.$id2);
    $data = $this->getCachedQuery('relatedness',$key);
    $fromCache = true;



    $query = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>
    PREFIX dive: <http://purl.org/collections/nl/dive/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    SELECT DISTINCT ?event
    WHERE {
      {
        <'.$id1.'> (dive:isRelatedTo|^dive:isRelatedTo) ?event.
        ?event rdf:type sem:Event.
        ?event (dive:isRelatedTo|^dive:isRelatedTo) <'.$id2.'>.
      } UNION{
        <'.$id1.'> (owl:sameAs*|^owl:sameAs*) ?same.
        ?same (dive:isRelatedTo|^dive:isRelatedTo) ?event.
        ?event rdf:type sem:Event.
        ?event (dive:isRelatedTo|^dive:isRelatedTo) <'.$id2.'>.
      }
    } OFFSET 0 LIMIT 200';

    $this->storeQuery($query);
    if (!$data){
      $fromCache = false;
      $data = $this->getQuery($query);
      $this->setCachedQuery('details', $key, $data);
    }
    $timeEnd = microtime(true);
    if ($this->getRequest()->get('showQuery',false)){
     echo $query . "\n\n";
   }
   $this->dataResponse(array(
     'took' => $timeEnd - $timeStart,
     'query'=> $query,
     'fromCache'=>$fromCache
     ), $data);

 }

 /**
     * @Route("/entity/related/test")
     */
 public function relatedTestAction()
 {
  $id = $this->getRequest()->get('id',0);
  $timeStart = microtime(true);
  $offset = intval($this->getRequest()->get('offset',0));
  $limit = intval($this->getRequest()->get('limit',850));
//?related rdf:value ?entity.

  $query= '
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>
  PREFIX dive: <http://purl.org/collections/nl/dive/>
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  SELECT DISTINCT ?entity WHERE {
    {
      <'.$id.'> dive:isRelatedTo ?entity.
    } UNION {
      ?entity dive:isRelatedTo <'.$id.'>.
    } UNION {
      ?event dive:isRelatedTo <'.$id.'>.
      ?event rdf:type sem:Event.
      ?event dive:isRelatedTo ?entity.
    } UNION {
      ?event dive:isRelatedTo <'.$id.'>.
      ?event rdf:type sem:Event.
      ?entity dive:isRelatedTo ?event.
    } UNION {
      <'.$id.'> dive:isRelatedTo ?event.
      ?event rdf:type sem:Event.
      ?entity dive:isRelatedTo ?event.
    } UNION {
      <'.$id.'> dive:isRelatedTo ?event.
      ?event rdf:type sem:Event.
      ?event dive:isRelatedTo ?entity.
    }
  } GROUP BY ?entity ?type ?label ?timestamp ?dbpediatype ORDER BY ASC(?event) OFFSET '.$offset.' LIMIT ' . $limit;

  $this->storeQuery($query);
  $data = $this->getQuery($query, 'rdfs');
  $timeEnd = microtime(true);

  if ($this->getRequest()->get('showQuery',false)){
   echo $query . "\n\n";
 }

 $this->dataResponse(array(
   'took' => $timeEnd - $timeStart,
   'query'=> $query,
   ), $data,'');
}

}
