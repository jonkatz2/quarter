library(qrcode)
library(openssl)
library(base64url)

secret <- "supersecretsupersecr"
secret32 <- base32_encode(secret)
secretmsg <- paste0("otpauth://totp/jonkatz2@gmail.com?secret=", secret32, "&issuer=test")
qrcode_gen(secretmsg)

now <- function() as.numeric(Sys.time())
# mysha1 <- function(x) digest(x, algo='sha1', serialize=FALSE)
rawToInt <- function(x, part=NULL) {
    logivect <- as.logical(rawToBits(x))
    if(length(part)) {
        if(part == "l") logivect <- logivect[1:4] # lower nibble
        else if(part == "m") logivect[length(logivect)] <- FALSE # mask most sig. bit
    }
    sum(2^(which(logivect)-1))
} 
authenticator <- function() {
    n <- now()
    # hmac <- mysha1(paste0(secret, n%/%30))
    # hmac <- mysha1(paste0(secret, mysha1(paste0(secret, n%/%30))))
    hmac <- openssl::sha1(secret, key=openssl::sha1(secret, key=intToBits(n/30)))
    # hmac <- openssl::sha1(secret, key=openssl::sha1(secret, key=charToRaw(as.character(n%/%30))))
    # hmac <- openssl::sha1(secret, key=openssl::sha1(secret, key=pack::numToRaw(n%/%30, 5)))
    # hmac <- openssl::sha1(secret, key=key=charToRaw(as.character(now())))
    # Time remaining
    remain <- round(30-n%%30)
    hmr <- charToRaw(hmac)
    # Take the last byte
    last_byte <- hmr[length(hmr)]
    # Use only half of it
    offset <- rawToInt(last_byte, part='l')
    offset <- (offset+1):(offset+4)
    four_bytes <- hmr[offset]
    # Ignore most sig. bit
    large_integer <- rawToInt(four_bytes, part='m')
    small_integer <- large_integer %% 1e6
    nc <- nchar(small_integer)
    small_integer <- paste0(rep(0, 6-nc), format(small_integer, big.mark=" "))
    cat(
        remain, "seconds remaining\n",
        small_integer, "\n"
    )
    invisible(small_integer)
}

authenticator()

