package domain

import org.joda.time.DateTime

case class UserAction(timestamp: DateTime, 
                      appDomain: Int, 
                      configSku: String, 
                      simpleSku: Option[String],
                      customerId: Option[Long],
                      sessionId: String,
                      action: String,
                      quantity: Option[Int],
                      price: Option[Int],
                      orderId: Option[Long],
                      flowId: String,
                      refferLink: Option[String])
