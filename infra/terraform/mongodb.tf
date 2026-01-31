# Pseudo-code (Atlas provider)
resource "mongodbatlas_cluster" "main" {
  name       = "${var.app_name}-mongo"
  provider   = "AWS"
  region     = "AP_SOUTHEAST_1"
  tier       = "M10"
}
