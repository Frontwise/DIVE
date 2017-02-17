<?php

namespace Frontwise\AjaxLogBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Response;

use Frontwise\AjaxLogBundle\Entity\AjaxLog;

/**
 * @Route("/ajaxlog")
 */

class LogController extends Controller
{
    /**
     * @Route("/{level}")
     * @Method({"POST"})
     */
    public function createAction($level = 'info')
    {

        switch($level){
            case 'error':
                $level = 1;
            break;
            case 'security':
                $level = 2;
            break;
            case 'debug':
                $level = 3;
            break;
            default:
            $level = 0;
        }

        // save session
        $this->get('session')->save();
    	// get request
    	$request = $this->getRequest();
    	// get current user
    	$user = $this->getUser();
    	// create new log
    	$log = new AjaxLog();
    	if ($log->isValidLevel($level) === false){
    		return new Response('Unknown level');
    	}
    	// set log content
    	$log->setLevel($level)
    	->setIp($request->getClientIp())
    	->setUser(is_object($user) ? $user->getId() . $user->getUsername() : '')
    	->setBrowser($this->getRequest()->headers->get('User-Agent'))
    	->setReferer($request->get('referer',$this->getRequest()->headers->get('referer') ? $this->getRequest()->headers->get('referer') : ''))
    	->setAction($request->get('action',''))
    	->setDetails($request->get('details',''))
    	;
    	// store log to DB
    	$manager = $this->getDoctrine()->getManager();
    	$manager->persist($log);
    	$manager->flush();
    	return new Response('ok');
    }

    // get current user (if any)

    public function getUser(){
    	if ($this->get('security.context') && $this->get('security.context')->getToken() && $this->get('security.context')->getToken()->getUser()) {
    		return $this->get('security.context')->getToken()->getUser();
    	}
    	return null;
    }

}
