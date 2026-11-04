use tonic::{Request, Response, Status};

use super::proto::nix_dashboard_server::{NixDashboard, NixDashboardServer};
use super::proto::*;
use crate::nix::{config, profile, search, store};

#[derive(Debug, Default)]
pub struct NixDashboardService {}

#[tonic::async_trait]
impl NixDashboard for NixDashboardService {
    async fn search(
        &self,
        request: Request<SearchRequest>,
    ) -> Result<Response<SearchResponse>, Status> {
        let req = request.into_inner();
        let result =
            tokio::task::spawn_blocking(move || search::nix_search_sync(&req.query, &req.system))
                .await
                .map_err(|e| Status::internal(format!("Task join error: {}", e)))?
                .map_err(|e| Status::internal(e))?;

        Ok(Response::new(SearchResponse {
            json_result: result,
        }))
    }

    async fn get_package_detail(
        &self,
        request: Request<PackageDetailRequest>,
    ) -> Result<Response<PackageDetailResponse>, Status> {
        let req = request.into_inner();
        let result =
            tokio::task::spawn_blocking(move || search::nix_package_detail_sync(&req.package_key))
                .await
                .map_err(|e| Status::internal(format!("Task join error: {}", e)))?
                .map_err(|e| Status::internal(e))?;

        Ok(Response::new(PackageDetailResponse {
            json_result: result,
        }))
    }

    async fn get_package_dependencies(
        &self,
        request: Request<PackageDependenciesRequest>,
    ) -> Result<Response<PackageDependenciesResponse>, Status> {
        let req = request.into_inner();
        let result = tokio::task::spawn_blocking(move || {
            search::nix_package_dependencies_sync(&req.package_key)
        })
        .await
        .map_err(|e| Status::internal(format!("Task join error: {}", e)))?
        .map_err(|e| Status::internal(e))?;

        Ok(Response::new(PackageDependenciesResponse {
            json_result: result,
        }))
    }

    async fn profile_list(
        &self,
        _request: Request<ProfileListRequest>,
    ) -> Result<Response<ProfileListResponse>, Status> {
        let result = tokio::task::spawn_blocking(profile::nix_profile_list_sync)
            .await
            .map_err(|e| Status::internal(format!("Task join error: {}", e)))?
            .map_err(|e| Status::internal(e))?;

        Ok(Response::new(ProfileListResponse {
            json_result: result,
        }))
    }

    async fn profile_remove(
        &self,
        request: Request<ProfileRemoveRequest>,
    ) -> Result<Response<ProfileRemoveResponse>, Status> {
        let req = request.into_inner();
        let result =
            tokio::task::spawn_blocking(move || profile::nix_profile_remove_sync(req.index))
                .await
                .map_err(|e| Status::internal(format!("Task join error: {}", e)))?
                .map_err(|e| Status::internal(e))?;

        Ok(Response::new(ProfileRemoveResponse { message: result }))
    }

    async fn profile_upgrade(
        &self,
        request: Request<ProfileUpgradeRequest>,
    ) -> Result<Response<ProfileUpgradeResponse>, Status> {
        let req = request.into_inner();
        let result =
            tokio::task::spawn_blocking(move || profile::nix_profile_upgrade_sync(req.index))
                .await
                .map_err(|e| Status::internal(format!("Task join error: {}", e)))?
                .map_err(|e| Status::internal(e))?;

        Ok(Response::new(ProfileUpgradeResponse { message: result }))
    }

    async fn profile_history(
        &self,
        _request: Request<ProfileHistoryRequest>,
    ) -> Result<Response<ProfileHistoryResponse>, Status> {
        let result = tokio::task::spawn_blocking(profile::nix_profile_history_sync)
            .await
            .map_err(|e| Status::internal(format!("Task join error: {}", e)))?
            .map_err(|e| Status::internal(e))?;

        Ok(Response::new(ProfileHistoryResponse { result }))
    }

    async fn profile_rollback(
        &self,
        _request: Request<ProfileRollbackRequest>,
    ) -> Result<Response<ProfileRollbackResponse>, Status> {
        let result = tokio::task::spawn_blocking(profile::nix_profile_rollback_sync)
            .await
            .map_err(|e| Status::internal(format!("Task join error: {}", e)))?
            .map_err(|e| Status::internal(e))?;

        Ok(Response::new(ProfileRollbackResponse { message: result }))
    }

    async fn store_gc(
        &self,
        request: Request<StoreGcRequest>,
    ) -> Result<Response<StoreGcResponse>, Status> {
        let req = request.into_inner();
        let result = tokio::task::spawn_blocking(move || store::nix_store_gc_sync(req.dry_run))
            .await
            .map_err(|e| Status::internal(format!("Task join error: {}", e)))?
            .map_err(|e| Status::internal(e))?;

        Ok(Response::new(StoreGcResponse { result }))
    }

    async fn store_optimise(
        &self,
        _request: Request<StoreOptimiseRequest>,
    ) -> Result<Response<StoreOptimiseResponse>, Status> {
        let result = tokio::task::spawn_blocking(store::nix_store_optimise_sync)
            .await
            .map_err(|e| Status::internal(format!("Task join error: {}", e)))?
            .map_err(|e| Status::internal(e))?;

        Ok(Response::new(StoreOptimiseResponse { result }))
    }

    async fn store_info(
        &self,
        _request: Request<StoreInfoRequest>,
    ) -> Result<Response<StoreInfoResponse>, Status> {
        let result = tokio::task::spawn_blocking(store::nix_store_info_sync)
            .await
            .map_err(|e| Status::internal(format!("Task join error: {}", e)))?
            .map_err(|e| Status::internal(e))?;

        Ok(Response::new(StoreInfoResponse { result }))
    }

    async fn store_stats(
        &self,
        _request: Request<StoreStatsRequest>,
    ) -> Result<Response<StoreStatsResponse>, Status> {
        let result = tokio::task::spawn_blocking(store::nix_store_stats_sync)
            .await
            .map_err(|e| Status::internal(format!("Task join error: {}", e)))?
            .map_err(|e| Status::internal(e))?;

        Ok(Response::new(StoreStatsResponse {
            json_result: result,
        }))
    }

    async fn store_gc_roots(
        &self,
        _request: Request<StoreGcRootsRequest>,
    ) -> Result<Response<StoreGcRootsResponse>, Status> {
        let result = tokio::task::spawn_blocking(store::nix_store_gc_roots_sync)
            .await
            .map_err(|e| Status::internal(format!("Task join error: {}", e)))?
            .map_err(|e| Status::internal(e))?;

        Ok(Response::new(StoreGcRootsResponse {
            json_result: result,
        }))
    }

    async fn load_config(
        &self,
        _request: Request<LoadConfigRequest>,
    ) -> Result<Response<LoadConfigResponse>, Status> {
        let result = tokio::task::spawn_blocking(config::load_config_sync)
            .await
            .map_err(|e| Status::internal(format!("Task join error: {}", e)))?
            .map_err(|e| Status::internal(e))?;

        Ok(Response::new(LoadConfigResponse {
            json_result: result,
        }))
    }

    async fn save_config(
        &self,
        request: Request<SaveConfigRequest>,
    ) -> Result<Response<SaveConfigResponse>, Status> {
        let req = request.into_inner();
        let result =
            tokio::task::spawn_blocking(move || config::save_config_sync(&req.config_json))
                .await
                .map_err(|e| Status::internal(format!("Task join error: {}", e)))?
                .map_err(|e| Status::internal(e))?;

        Ok(Response::new(SaveConfigResponse { message: result }))
    }
}

pub async fn start_grpc_server() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let addr = "[::1]:50051".parse()?;
    let service = NixDashboardService::default();

    tonic::transport::Server::builder()
        .add_service(NixDashboardServer::new(service))
        .serve(addr)
        .await?;

    Ok(())
}
