<?php

namespace Dive\FrontBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use JMS\SecurityExtraBundle\Annotation\Secure;
use Dive\FrontBundle\Entity\User;


class BrowseController extends BaseController
{
    /**
     * @Route("/{dataset}", defaults={"dataset" = "openbeelden"})
     * @Template()
     */
    public function indexAction($dataset)
    {
        $datasets = $this->container->getParameter('datasets');
        if (!in_array($dataset, $datasets)){
            throw new NotFoundHttpException('Dataset not found'); 
        }
        return array(
           'user'=> $this->getUser(),
           'dataset'=>$dataset
           );
    }

}
