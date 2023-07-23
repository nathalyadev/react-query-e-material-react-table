function scrollInfinitoEstaHabilitado(
    arrayLength: number,
    isLooking: boolean,
    pagination: IPagination
): boolean {
    if (
        arrayLength > 0 &&
        !isLooking &&
        pagination.pagina <
        (appConfigs.ITENS_POR_PAGINA_PADRAO === 0
            ? pagination.totalDePaginas - 1
            : pagination.totalDePaginas)
    )
        return true;

    return false;
}

export const Verify = {
    // scrollInfinitoEstaHabilitado
}