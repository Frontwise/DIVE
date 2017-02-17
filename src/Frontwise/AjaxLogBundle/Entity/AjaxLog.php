<?php

namespace Frontwise\AjaxLogBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * AjaxLog
 *
 * @ORM\Table()
 * @ORM\Entity
 */
class AjaxLog
{
    // Log levels
    public static $LEVEL_INFO = 0;
    public static $LEVEL_ERROR = 1;
    public static $LEVEL_SECURITY = 2;
    public static $LEVEL_DEBUG = 3;

    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="action", type="string", length=255)
     */
    private $action;

    /**
     * @var string
     *
     * @ORM\Column(name="user", type="string", length=255)
     */
    private $user;

    /**
     * @var string
     *
     * @ORM\Column(name="ip", type="string", length=64)
     */
    private $ip;

    /**
     * @var integer
     *
     * @ORM\Column(name="level", type="integer")
     */
    private $level;

    /**
     * @var string
     *
     * @ORM\Column(name="details", type="text")
     */
    private $details;

    /**
     * @var string
     *
     * @ORM\Column(name="browser", type="text")
     */
    private $browser;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var string
     *
     * @ORM\Column(name="referer", type="string", length=512)
     */
    private $referer;


    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set action
     *
     * @param string $action
     * @return AjaxLog
     */
    public function setAction($action)
    {
        $this->action = $action;

        return $this;
    }

    /**
     * Get action
     *
     * @return string
     */
    public function getAction()
    {
        return $this->action;
    }

    /**
     * Set user
     *
     * @param string $user
     * @return AjaxLog
     */
    public function setUser($user)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return string
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * Set ip
     *
     * @param string $ip
     * @return AjaxLog
     */
    public function setIp($ip)
    {
        $this->ip = $ip;

        return $this;
    }

    /**
     * Get ip
     *
     * @return string
     */
    public function getIp()
    {
        return $this->ip;
    }

    public function getLevelNames(){
        return array(
            self::$LEVEL_DEBUG => 'debug',
            self::$LEVEL_SECURITY => 'security',
            self::$LEVEL_ERROR => 'error',
            self::$LEVEL_INFO => 'info',
            );
    }

    public function isValidLevel($level){
        $levelNames = $this->getLevelNames();

        if (!is_numeric($level)){
            // valid level name
            $len = count($levelNames);
            while($len--){
                if($levelNames[$len] == $level){
                    return $len;
                }
            }
            return self::$LEVEL_INFO;
        } else{
            // valid numeric level
            if ($level < count($levelNames)){
                return $level;
            }
        }
        // not a valid level
        return false;
    }

    /**
     * Set level
     *
     * @param integer $level
     * @return AjaxLog
     */
    public function setLevel($level)
    {
        $this->level = $level;
        return $this;
    }

    /**
     * Get level
     *
     * @return integer
     */
    public function getLevel()
    {
        return $this->level;
    }

    /**
     * Set details
     *
     * @param string $details
     * @return AjaxLog
     */
    public function setDetails($details)
    {
        $this->details = $details;

        return $this;
    }

    /**
     * Get details
     *
     * @return string
     */
    public function getDetails()
    {
        return $this->details;
    }

    /**
     * Set browser
     *
     * @param string $browser
     * @return AjaxLog
     */
    public function setBrowser($browser)
    {
        $this->browser = $browser;

        return $this;
    }

    /**
     * Get browser
     *
     * @return string
     */
    public function getBrowser()
    {
        return $this->browser;
    }

    /**
     * Set createdAt
     *
     * @param \DateTime $createdAt
     * @return AjaxLog
     */
    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    /**
     * Get createdAt
     *
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * Set referer
     *
     * @param string $referer
     * @return AjaxLog
     */
    public function setReferer($referer)
    {
        $this->referer = $referer;

        return $this;
    }

    /**
     * Get referer
     *
     * @return string
     */
    public function getReferer()
    {
        return $this->referer;
    }

    public function __construct(){
        $this->createdAt = new \DateTime();
    }
}
