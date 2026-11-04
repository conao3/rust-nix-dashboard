#![allow(dead_code)]

use super::proto::nix_dashboard_client::NixDashboardClient;
use super::proto::*;

pub struct NixDashboardGrpcClient {
    client: NixDashboardClient<tonic::transport::Channel>,
}

impl NixDashboardGrpcClient {
    pub async fn connect(addr: &str) -> Result<Self, tonic::transport::Error> {
        let client = NixDashboardClient::connect(addr.to_string()).await?;
        Ok(Self { client })
    }

    pub async fn search(&mut self, query: &str, system: &str) -> Result<String, tonic::Status> {
        let request = tonic::Request::new(SearchRequest {
            query: query.to_string(),
            system: system.to_string(),
        });
        let response = self.client.search(request).await?;
        Ok(response.into_inner().json_result)
    }

    pub async fn get_package_detail(&mut self, package_key: &str) -> Result<String, tonic::Status> {
        let request = tonic::Request::new(PackageDetailRequest {
            package_key: package_key.to_string(),
        });
        let response = self.client.get_package_detail(request).await?;
        Ok(response.into_inner().json_result)
    }

    pub async fn get_package_dependencies(
        &mut self,
        package_key: &str,
    ) -> Result<String, tonic::Status> {
        let request = tonic::Request::new(PackageDependenciesRequest {
            package_key: package_key.to_string(),
        });
        let response = self.client.get_package_dependencies(request).await?;
        Ok(response.into_inner().json_result)
    }

    pub async fn profile_list(&mut self) -> Result<String, tonic::Status> {
        let request = tonic::Request::new(ProfileListRequest {});
        let response = self.client.profile_list(request).await?;
        Ok(response.into_inner().json_result)
    }

    pub async fn profile_remove(&mut self, index: u32) -> Result<String, tonic::Status> {
        let request = tonic::Request::new(ProfileRemoveRequest { index });
        let response = self.client.profile_remove(request).await?;
        Ok(response.into_inner().message)
    }

    pub async fn profile_upgrade(&mut self, index: Option<u32>) -> Result<String, tonic::Status> {
        let request = tonic::Request::new(ProfileUpgradeRequest { index });
        let response = self.client.profile_upgrade(request).await?;
        Ok(response.into_inner().message)
    }

    pub async fn profile_history(&mut self) -> Result<String, tonic::Status> {
        let request = tonic::Request::new(ProfileHistoryRequest {});
        let response = self.client.profile_history(request).await?;
        Ok(response.into_inner().result)
    }

    pub async fn profile_rollback(&mut self) -> Result<String, tonic::Status> {
        let request = tonic::Request::new(ProfileRollbackRequest {});
        let response = self.client.profile_rollback(request).await?;
        Ok(response.into_inner().message)
    }

    pub async fn store_gc(&mut self, dry_run: bool) -> Result<String, tonic::Status> {
        let request = tonic::Request::new(StoreGcRequest { dry_run });
        let response = self.client.store_gc(request).await?;
        Ok(response.into_inner().result)
    }

    pub async fn store_optimise(&mut self) -> Result<String, tonic::Status> {
        let request = tonic::Request::new(StoreOptimiseRequest {});
        let response = self.client.store_optimise(request).await?;
        Ok(response.into_inner().result)
    }

    pub async fn store_info(&mut self) -> Result<String, tonic::Status> {
        let request = tonic::Request::new(StoreInfoRequest {});
        let response = self.client.store_info(request).await?;
        Ok(response.into_inner().result)
    }

    pub async fn store_stats(&mut self) -> Result<String, tonic::Status> {
        let request = tonic::Request::new(StoreStatsRequest {});
        let response = self.client.store_stats(request).await?;
        Ok(response.into_inner().json_result)
    }

    pub async fn store_gc_roots(&mut self) -> Result<String, tonic::Status> {
        let request = tonic::Request::new(StoreGcRootsRequest {});
        let response = self.client.store_gc_roots(request).await?;
        Ok(response.into_inner().json_result)
    }

    pub async fn load_config(&mut self) -> Result<String, tonic::Status> {
        let request = tonic::Request::new(LoadConfigRequest {});
        let response = self.client.load_config(request).await?;
        Ok(response.into_inner().json_result)
    }

    pub async fn save_config(&mut self, config_json: &str) -> Result<String, tonic::Status> {
        let request = tonic::Request::new(SaveConfigRequest {
            config_json: config_json.to_string(),
        });
        let response = self.client.save_config(request).await?;
        Ok(response.into_inner().message)
    }
}
