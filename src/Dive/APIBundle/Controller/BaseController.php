<?php

namespace Dive\APIBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Dive\APIBundle\Entity\QueryCache;
use Symfony\Component\HttpFoundation\Response;

class BaseController extends Controller
{
    var $dataSet = 0;

    // store session (unlocks session for other calls)
    public function saveSession(){
        $session = $this->get('session');
        $session->save();
    }

    // get repository
    public function getRepo($entity){
        return $this->getDoctrine()->getRepository('DiveAPIBundle:' . $entity);
    }

    public $cacheEnabled = true;

    // get query from cache
    public function getCachedQuery($queryType,$request){
        if (!$this->cacheEnabled){ return false;}

        $qb = $this->getRepo('QueryCache')->createQueryBuilder('qc');

        $qb
        ->where('qc.queryType = :queryType')
        ->setParameter('queryType',$queryType)
        ->andWhere('qc.request = :request')
        ->setParameter('request',$request)
        ->andWhere('qc.dataSet = :dataSet')
        ->setParameter('dataSet',$this->dataSet)
        ->setMaxResults(1)
        ;

        $query = $qb->getQuery();

        $cached = $query->getResult();
        if ($cached && is_array($cached)) { $cached = $cached[0]; }



        if ($cached){
            $maxAge = new \DateTime('-1 month');
            if ($cached->getCreatedAt() < $maxAge){
                // remove from cache
                $manager = $this->getDoctrine()->getManager();
                $manager->remove($cached);
                $manager->flush();
                return false;
            }
            return $cached->getData();
        }
        return false;
    }


    // save cached query
    public function setCachedQuery($queryType,$request,$data){
        if (!$this->cacheEnabled){ return false;}
        $cached = new QueryCache();
        $cached->setRequest($request);
        $cached->setQueryType($queryType);
        $cached->setData($data);
        $cached->setDataSet($this->dataSet);
        $manager = $this->getDoctrine()->getManager();
        $manager->persist($cached);
        $manager->flush();
    }


    // curl
    public function getCurl($url){
     $ch = curl_init();
     $timeout = 5;
     curl_setopt($ch, CURLOPT_URL, $url);
     curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
     curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
     $data = curl_exec($ch);
     curl_close($ch);
     return $data;
    }


 // create data response
 public function dataResponse($meta, $data, $etag){
    $data = ($data != '') ? $data : '{"error":"No API response"}';
    $jsonString = '{';
    $jsonString .= '"meta": '. json_encode($meta);
    $jsonString .= ', "data": ' . $data;
    $jsonString .= '}';
    return $this->JSONResponse($jsonString,$etag);
}


// json response
public function JSONResponse($jsonString,$etag){
    $response = new Response();
    $response->setETag($etag);
    $response->setLastModified(new \DateTime());

    // Set response as public. Otherwise it will be private by default.
    $response->setPublic();
    $response->headers->set('Content-Type', 'application/json');

    $response->setMaxAge(600);
    $response->setSharedMaxAge(600);

   // Check that the Response is not modified for the given Request
    if ($response->isNotModified($this->getRequest())) {
      // return the 304 Response immediately
      return $response;
  }

  $response->setContent($jsonString);
  return $response;
}

}