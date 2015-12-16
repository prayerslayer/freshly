package domain

import org.joda.time.DateTime

case class CatalogView(timestamp: DateTime,
                       appDomain: Int,
                        customerId: Option[Long],
                        sessionId: String,
                        jsonData: String,
                        skuList: Seq[String],
                        viewType: String,
                        pageDetails: String,
                        hashValue: String)
