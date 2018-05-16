<?php

namespace Dive\APIBundle\Controller;

use Dive\APIBundle\Entity\DataEntity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

/**
 * @Route("/openbeelden/api/v2")
 */

class OpenBeeldenDataController extends BaseController
{

  public $dataSet = 2;
  public $apiHost = 'http://data.diveplus.frontwise.com/data/ogTUxdlqbyS4FsZmsQdOEGgmS2U795/openbeelden-graph';
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
    return $this->dataResponse([
      'took'      => $timeEnd - $timeStart,
      'query'     => $searchData['query'],
      'fromCache' => $searchData['fromCache'],
    ], $searchData['data'], $searchData['key']);
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
    return $this->dataResponse([
      'took'      => $timeEnd - $timeStart,
      'query'     => $searchData['query'],
      'fromCache' => $searchData['fromCache'],
    ], $searchData['data'], $searchData['key']);
  }

  // convert rawdata from search to dive entity
  private function createDataEntity($data)
  {
    $dataEntity = new DataEntity();
    $dataEntity
      ->setUid(isset($data->id) ? $data->id : 'no-id')
      ->setType(isset($data->type) ? $data->type : 'no-type')
      ->setTitle(isset($data->name) ? $data->name : '<no title>')
      ->setDescription(isset($data->description) ? $data->description : '<no-description>')

      ->setDepictedBySource(isset($data->media) ? $data->media : '')
      ->setDepictedByPlaceHolder(isset($data->thumbnail) ? $data->thumbnail : '')

      ->setDateStart(isset($data->dateStart) ? $data->dateStart : '')
      ->setDateEnd(isset($data->dateEnd) ? $data->dateEnd : '');
    return $dataEntity;
  }

  private function createSearchUrl($keywords)
  {
    return $this->apiHost . '/search?query=' . urlencode($keywords);
  }

  // get search data

  private function getSearchData($type)
  {

    // get parameters
    $keywords = $this->getRequest()->get('keywords', '');
    $offset   = intval($this->getRequest()->get('offset', 0));
    $limit    = intval($this->getRequest()->get('limit', 850));
    $key      = sha1($keywords . $offset . $limit);

    // get data from cache
    $data         = $this->getCachedQuery($type, $key);
    $fromCache    = true;
    $keywordsList = '';

    // if no data from cache was found, get query from server
    if (true || !$data) {

      $fromCache = false;
      $url       = $this->createSearchUrl($keywords);
      $data      = json_encode($this->convertSearchToDiveData($this->getCurl($url)));
      // store result in cache
      $this->setCachedQuery($type, $key, $data);
    }

    return [
      'query'     => 'Search call to OpenBeelden graph',
      'data'      => $data,
      'fromCache' => $fromCache,
      'key'       => $key,
    ];
  }

  public function convertSearchToDiveData($data)
  {
    $json = json_decode($data);

    $diveData = [];

    // json succeeded
    if (json_last_error() == 0 && isset($json->data)) {
      // loop al bindings
      for ($i = 0, $len = count($json->data); $i < $len; $i++) {
        $diveData[] = $this->createDataEntity($json->data[$i]->entity);
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
    $id  = $this->getRequest()->get('id', 0);
    $key = sha1($id);

    // get data from cache
    $data      = $this->getCachedQuery('details', $key);
    $fromCache = true;

    if (true || !$data) {
      $fromCache = false;
      $url       = $this->createDetailsUrl($id);
      $data      = json_encode($this->convertDetailsToDiveData($this->getCurl($url)));
      $this->setCachedQuery('details', $key, $data);
    }
    $timeEnd = microtime(true);

    return $this->dataResponse([
      'took'      => $timeEnd - $timeStart,
      'query'     => 'Record/full call to OpenBeelden graph',
      'fromCache' => $fromCache,
    ], $data, $key);

  }

  public function convertDetailsToDiveData($data)
  {
    $json     = json_decode($data);
    $diveData = [];
    // json succeeded
    if (json_last_error() == 0 && isset($json->data) && is_array($json->data) || count($json->data) > 0) {
      $diveData[] = $this->createDataEntity($json->data[0]->entity);
    }

    return $diveData;
  }

  private function createDetailsUrl($id)
  {
    return $this->apiHost . '/entity?id=' . urlencode($id);
  }

  private function createRelatedUrl($id)
  {
    return $this->apiHost . '/related?id=' . urlencode($id);
  }

  public function convertRelatedToDiveData($data)
  {
    $json     = json_decode($data);
    $diveData = [];

    if (json_last_error() == 0 && isset($json->data)) {
      // loop al bindings
      for ($i = 0, $len = count($json->data); $i < $len; $i++) {
        $diveData[] = $this->createDataEntity($json->data[$i]->entity);
      }
    }
    return $diveData;
  }

  /**
   * @Route("/entity/related")
   */
  public function relatedAction()
  {
    // start time measurement
    $timeStart = microtime(true);

    // get parameters
    $id     = $this->getRequest()->get('id', 0);
    $key    = sha1($id);

    // get data from cache
    $data      = $this->getCachedQuery('related', $key);

    $fromCache = true;
    if (true ||  count($data) == 0) {
      $fromCache = false;
      $url       = $this->createRelatedUrl($id);
      $data      = json_encode($this->convertRelatedToDiveData($this->getCurl($url)));
      // get data
      $this->setCachedQuery('related', $key, $data);
    }

    $timeEnd = microtime(true);

    return $this->dataResponse([
      'took'  => $timeEnd - $timeStart,
      'query' => 'Related call to OpenBeelden graph',
    ], $data, $key);
  }

  public function storeQuery($query)
  {
    file_put_contents('/tmp/dive-query.txt', str_replace('  ', ' ', trim(preg_replace('/\t+/', '', $query))));
  }

  /**
   * @Route("/cache/flush/yesiamsure")
   */
  public function cacheFlushAction()
  {
    $cached  = $this->getRepo('QueryCache')->findBy(['dataSet' => $this->dataSet]);
    $manager = $this->getDoctrine()->getManager();
    if ($cached) {
      foreach ($cached as $c) {
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
    $id1       = addslashes($this->getRequest()->get('id1', 0));
    $id2       = addslashes($this->getRequest()->get('id2', 0));
    $key       = sha1($id1 . $id2);
    $data      = $this->getCachedQuery('relatedness', $key);
    $fromCache = true;

    $query = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>
    PREFIX dive: <http://purl.org/collections/nl/dive/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    SELECT DISTINCT ?event
    WHERE {
      {
        <' . $id1 . '> (dive:isRelatedTo|^dive:isRelatedTo) ?event.
        ?event rdf:type sem:Event.
        ?event (dive:isRelatedTo|^dive:isRelatedTo) <' . $id2 . '>.
      } UNION{
        <' . $id1 . '> (owl:sameAs*|^owl:sameAs*) ?same.
        ?same (dive:isRelatedTo|^dive:isRelatedTo) ?event.
        ?event rdf:type sem:Event.
        ?event (dive:isRelatedTo|^dive:isRelatedTo) <' . $id2 . '>.
      }
    } OFFSET 0 LIMIT 200';

    $this->storeQuery($query);
    if (!$data) {
      $fromCache = false;
      $data      = $this->getQuery($query);
      $this->setCachedQuery('details', $key, $data);
    }
    $timeEnd = microtime(true);
    if ($this->getRequest()->get('showQuery', false)) {
      echo $query . "\n\n";
    }
    $this->dataResponse([
      'took'      => $timeEnd - $timeStart,
      'query'     => $query,
      'fromCache' => $fromCache,
    ], $data);

  }

}
