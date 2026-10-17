"""
Custom Domain Exceptions & FastAPI Exception Handlers for UIS.
Provides consistent error structures across all API endpoints.
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse


class UISBaseException(Exception):
    """Base exception for all domain-specific errors."""
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST, error_code: str = "BAD_REQUEST"):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(message)


class EntityNotFoundException(UISBaseException):
    """Raised when an entity (Area, Indicator, Score) does not exist in the database."""
    def __init__(self, entity_name: str, identifier: any):
        super().__init__(
            message=f"{entity_name} with identifier '{identifier}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="NOT_FOUND"
        )


class CalculationException(UISBaseException):
    """Raised when mathematical or methodology constraints are violated (e.g. weights != 1.0)."""
    def __init__(self, message: str):
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code="CALCULATION_ERROR"
        )


class ExternalServiceException(UISBaseException):
    """Raised when an external API (Gemini, Overpass) times out or errors."""
    def __init__(self, service_name: str, details: str):
        super().__init__(
            message=f"External service '{service_name}' failed: {details}",
            status_code=status.HTTP_502_BAD_GATEWAY,
            error_code="EXTERNAL_SERVICE_ERROR"
        )


class UnauthorizedException(UISBaseException):
    """Raised when authentication credentials are invalid or missing."""
    def __init__(self, message: str = "Invalid or expired authentication credentials."):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="UNAUTHORIZED"
        )


class ForbiddenException(UISBaseException):
    """Raised when a user lacks required permissions (e.g. citizen accessing government actions)."""
    def __init__(self, message: str = "Access forbidden: insufficient role permissions."):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="FORBIDDEN"
        )


async def uis_exception_handler(request: Request, exc: UISBaseException):
    """FastAPI global exception handler for UIS domain exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "error_code": exc.error_code,
            "detail": exc.message,
            "path": request.url.path,
        }
    )
