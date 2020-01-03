/*
 * Copyright (C) 2009 Apple Inc. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
 */
/* modified by wakufactory */
/*
    CanvasMatrix4 class
    
    This class implements a 4x4 matrix. It has functions which
    duplicate the functionality of the OpenGL matrix stack and
    glut functions.
    
    IDL:
    
    [
        Constructor(in CanvasMatrix4 matrix),           // copy passed matrix into new CanvasMatrix4
        Constructor(in sequence<float> array)           // create new CanvasMatrix4 with 16 floats (row major)
        Constructor()                                   // create new CanvasMatrix4 with identity matrix
    ]
    interface CanvasMatrix4 {
        attribute float buf[16]

        void load(in CanvasMatrix4 matrix);                 // copy the values from the passed matrix
        void load(in sequence<float> array);                // copy 16 floats into the matrix
        sequence<float> getAsArray();                       // return the matrix as an array of 16 floats
        WebGLFloatArray getAsWebGLFloatArray();           // return the matrix as a WebGLFloatArray with 16 values
        void makeIdentity();                                // replace the matrix with identity
        void transpose();                                   // replace the matrix with its transpose
        void invert();                                      // replace the matrix with its inverse
        
        void translate(in float x, in float y, in float z); // multiply the matrix by passed translation values on the right
        void scale(in float x, in float y, in float z);     // multiply the matrix by passed scale values on the right
        void rotate(in float angle,                         // multiply the matrix by passed rotation values on the right
                    in float x, in float y, in float z);    // (angle is in degrees)
        void multRight(in CanvasMatrix matrix);             // multiply the matrix by the passed matrix on the right
        void multLeft(in CanvasMatrix matrix);              // multiply the matrix by the passed matrix on the left
        void ortho(in float left, in float right,           // multiply the matrix by the passed ortho values on the right
                   in float bottom, in float top, 
                   in float near, in float far);
        void frustum(in float left, in float right,         // multiply the matrix by the passed frustum values on the right
                     in float bottom, in float top, 
                     in float near, in float far);
        void perspective(in float fovy, in float aspect,    // multiply the matrix by the passed perspective values on the right
                         in float zNear, in float zFar);
        void lookat(in float eyex, in float eyey, in float eyez,    // multiply the matrix by the passed lookat 
                    in float ctrx, in float ctry, in float ctrz,    // values on the right
                    in float upx, in float upy, in float upz);
    }
*/

CanvasMatrix4 = function(m) {
	if(m!=undefined && m.name == "Float32Array") {
		this.buf = m ;
		return this ;
	}
	this.buf = new Float32Array(16)
	this.matrix = null
    if (typeof m == 'object') {
        if ("length" in m && m.length >= 16) {
            this.load(m);
            return this;
        }
        else if (m instanceof CanvasMatrix4) {
            this.load(m);
            return this;
        }
    }
    this.makeIdentity();
    return this ;
}
CanvasMatrix4.RAD = Math.PI / 180 
CanvasMatrix4.prototype.load = function()
{
    if (arguments.length == 1 && typeof arguments[0] == 'object') {
        var matrix = arguments[0];
        
        if ("length" in matrix && matrix.length == 16) {
            this.buf[0] = matrix[0];
            this.buf[1] = matrix[1];
            this.buf[2] = matrix[2];
            this.buf[3] = matrix[3];

            this.buf[4] = matrix[4];
            this.buf[5] = matrix[5];
            this.buf[6] = matrix[6];
            this.buf[7] = matrix[7];

            this.buf[8] = matrix[8];
            this.buf[9] = matrix[9];
            this.buf[10] = matrix[10];
            this.buf[11] = matrix[11];

            this.buf[12] = matrix[12];
            this.buf[13] = matrix[13];
            this.buf[14] = matrix[14];
            this.buf[15] = matrix[15];
            return this ;
        }
            
        if (arguments[0] instanceof CanvasMatrix4) {
        
            this.buf[0] = matrix.buf[0];
            this.buf[1] = matrix.buf[1];
            this.buf[2] = matrix.buf[2];
            this.buf[3] = matrix.buf[3];

            this.buf[4] = matrix.buf[4];
            this.buf[5] = matrix.buf[5];
            this.buf[6] = matrix.buf[6];
            this.buf[7] = matrix.buf[7];

            this.buf[8] = matrix.buf[8];
            this.buf[9] = matrix.buf[9];
            this.buf[10] = matrix.buf[10];
            this.buf[11] = matrix.buf[11];

            this.buf[12] = matrix.buf[12];
            this.buf[13] = matrix.buf[13];
            this.buf[14] = matrix.buf[14];
            this.buf[15] = matrix.buf[15];
            return this ;
        }
    }
    
    this.makeIdentity();
    return this ;
}

CanvasMatrix4.prototype.getAsArray = function()
{
    return [
        this.buf[0], this.buf[1], this.buf[2], this.buf[3], 
        this.buf[4], this.buf[5], this.buf[6], this.buf[7], 
        this.buf[8], this.buf[9], this.buf[10], this.buf[11], 
        this.buf[12], this.buf[13], this.buf[14], this.buf[15]
    ];
}

CanvasMatrix4.prototype.getAsWebGLFloatArray = function()
{
    return this.buf
}
CanvasMatrix4.prototype.initmatrix = function() {
	if(!this.matrix) this.matrix = new CanvasMatrix4 
	this.matrix.makeIdentity() 
    return this ;
}
CanvasMatrix4.prototype.makeIdentity = function()
{
    this.buf[0] = 1;
    this.buf[1] = 0;
    this.buf[2] = 0;
    this.buf[3] = 0;
    
    this.buf[4] = 0;
    this.buf[5] = 1;
    this.buf[6] = 0;
    this.buf[7] = 0;
    
    this.buf[8] = 0;
    this.buf[9] = 0;
    this.buf[10] = 1;
    this.buf[11] = 0;
    
    this.buf[12] = 0;
    this.buf[13] = 0;
    this.buf[14] = 0;
    this.buf[15] = 1;
    return this ;
}

CanvasMatrix4.prototype.transpose = function()
{
    var tmp = this.buf[1];
    this.buf[1] = this.buf[4];
    this.buf[4] = tmp;
    
    tmp = this.buf[2];
    this.buf[2] = this.buf[8];
    this.buf[8] = tmp;
    
    tmp = this.buf[3];
    this.buf[3] = this.buf[12];
    this.buf[12] = tmp;
    
    tmp = this.buf[6];
    this.buf[6] = this.buf[9];
    this.buf[9] = tmp;
    
    tmp = this.buf[7];
    this.buf[7] = this.buf[13];
    this.buf[13] = tmp;
    
    tmp = this.buf[11];
    this.buf[11] = this.buf[14];
    this.buf[14] = tmp;
    return this ;
}

CanvasMatrix4.prototype.invert = function()
{
    // Calculate the 4x4 determinant
    // If the determinant is zero, 
    // then the inverse matrix is not unique.
    var det = this._determinant4x4();

    if (Math.abs(det) < 1e-8)
        return null;

    this._makeAdjoint();

    // Scale the adjoint matrix to get the inverse
    this.buf[0] /= det;
    this.buf[1] /= det;
    this.buf[2] /= det;
    this.buf[3] /= det;
    
    this.buf[4] /= det;
    this.buf[5] /= det;
    this.buf[6] /= det;
    this.buf[7] /= det;
    
    this.buf[8] /= det;
    this.buf[9] /= det;
    this.buf[10] /= det;
    this.buf[11] /= det;
    
    this.buf[12] /= det;
    this.buf[13] /= det;
    this.buf[14] /= det;
    this.buf[15] /= det;
    return this ;
}

CanvasMatrix4.prototype.translate = function(x,y,z)
{
	if(Array.isArray(x)|| x instanceof Float32Array) {
		y = x[1]; z = x[2]; x = x[0];
	}
    if (x == undefined)
        x = 0;
        if (y == undefined)
            y = 0;
    if (z == undefined)
        z = 0;
    
//    this.initmatrix()
//    this.matrix.buf[12] = x;
//    this.matrix.buf[13] = y;
//    this.matrix.buf[14] = z;
//    this.multRight(this.matrix);
    this.buf[12] += x;
    this.buf[13] += y;
    this.buf[14] += z;
    return this ;
}

CanvasMatrix4.prototype.scale = function(x,y,z)
{
	if(Array.isArray(x)|| x instanceof Float32Array) {
		y = x[1]; z = x[2]; x = x[0];
	}
    if (x == undefined)
        x = 1;
    if (z == undefined) {
        if (y == undefined) {
            y = x;
            z = x;
        }
        else
            z = 1;
    }
    else if (y == undefined)
        y = x;
    
//    this.initmatrix()
//    this.matrix.buf[0] = x;
//    this.matrix.buf[5] = y;
//    this.matrix.buf[10] = z;
//    this.multRight(this.matrix);
    
    this.buf[0] *= x ; this.buf[1] *= x ; this.buf[2] *= x ;
    this.buf[4] *= y ; this.buf[5] *= y ; this.buf[6] *= y ;
    this.buf[8] *= z ; this.buf[9] *= z ; this.buf[10] *= z ;
    return this ;
}

CanvasMatrix4.prototype.rotate = function(angle,x,y,z)
{
    if(angle==0) return this 
 	if(Array.isArray(x)|| x instanceof Float32Array) {
		y = x[1]; z = x[2]; x = x[0];
	}
    // angles are in degrees. Switch to radians
    angle = angle * CanvasMatrix4.RAD ;
    
    angle /= 2;
    var sinA = Math.sin(angle);
    var cosA = Math.cos(angle);
    var sinA2 = sinA * sinA;
 
    this.initmatrix()

    // optimize case where axis is along major axis
    if (x == 1 && y == 0 && z == 0) {
        this.matrix.buf[5] = 1 - 2 * sinA2;
        this.matrix.buf[6] = 2 * sinA * cosA;
        this.matrix.buf[9] = -2 * sinA * cosA;
        this.matrix.buf[10] = 1 - 2 * sinA2;
    } else if (x == 0 && y == 1 && z == 0) {
        this.matrix.buf[0] = 1 - 2 * sinA2;
        this.matrix.buf[2] = -2 * sinA * cosA;
        this.matrix.buf[8] = 2 * sinA * cosA;
        this.matrix.buf[10] = 1 - 2 * sinA2;
    } else if (x == 0 && y == 0 && z == 1) {
        this.matrix.buf[0] = 1 - 2 * sinA2;
        this.matrix.buf[1] = 2 * sinA * cosA;
        this.matrix.buf[4] = -2 * sinA * cosA;
        this.matrix.buf[5] = 1 - 2 * sinA2;
    } else {
	    // normalize
	    var length = Math.hypot(x,y,z);
	    if (length == 0) {
	        // bad vector, just use something reasonable
	        x = 0;
	        y = 0;
	        z = 1;
	    } else if (length != 1) {
	        x /= length;
	        y /= length;
	        z /= length;
	    }
        var x2 = x*x;
        var y2 = y*y;
        var z2 = z*z;
    
        this.matrix.buf[0] = 1 - 2 * (y2 + z2) * sinA2;
        this.matrix.buf[1] = 2 * (x * y * sinA2 + z * sinA * cosA);
        this.matrix.buf[2] = 2 * (x * z * sinA2 - y * sinA * cosA);
        this.matrix.buf[4] = 2 * (y * x * sinA2 - z * sinA * cosA);
        this.matrix.buf[5] = 1 - 2 * (z2 + x2) * sinA2;
        this.matrix.buf[6] = 2 * (y * z * sinA2 + x * sinA * cosA);
        this.matrix.buf[8] = 2 * (z * x * sinA2 + y * sinA * cosA);
        this.matrix.buf[9] = 2 * (z * y * sinA2 - x * sinA * cosA);
        this.matrix.buf[10] = 1 - 2 * (x2 + y2) * sinA2;
    }
    this.multRight(this.matrix);
    return this ;
}

CanvasMatrix4.prototype.multRight = function(matrix)
{
    var m11 = (this.buf[0] * matrix.buf[0] + this.buf[1] * matrix.buf[4]
               + this.buf[2] * matrix.buf[8] + this.buf[3] * matrix.buf[12]);
    var m12 = (this.buf[0] * matrix.buf[1] + this.buf[1] * matrix.buf[5]
               + this.buf[2] * matrix.buf[9] + this.buf[3] * matrix.buf[13]);
    var m13 = (this.buf[0] * matrix.buf[2] + this.buf[1] * matrix.buf[6]
               + this.buf[2] * matrix.buf[10] + this.buf[3] * matrix.buf[14]);
    var m14 = (this.buf[0] * matrix.buf[3] + this.buf[1] * matrix.buf[7]
               + this.buf[2] * matrix.buf[11] + this.buf[3] * matrix.buf[15]);

    var m21 = (this.buf[4] * matrix.buf[0] + this.buf[5] * matrix.buf[4]
               + this.buf[6] * matrix.buf[8] + this.buf[7] * matrix.buf[12]);
    var m22 = (this.buf[4] * matrix.buf[1] + this.buf[5] * matrix.buf[5]
               + this.buf[6] * matrix.buf[9] + this.buf[7] * matrix.buf[13]);
    var m23 = (this.buf[4] * matrix.buf[2] + this.buf[5] * matrix.buf[6]
               + this.buf[6] * matrix.buf[10] + this.buf[7] * matrix.buf[14]);
    var m24 = (this.buf[4] * matrix.buf[3] + this.buf[5] * matrix.buf[7]
               + this.buf[6] * matrix.buf[11] + this.buf[7] * matrix.buf[15]);

    var m31 = (this.buf[8] * matrix.buf[0] + this.buf[9] * matrix.buf[4]
               + this.buf[10] * matrix.buf[8] + this.buf[11] * matrix.buf[12]);
    var m32 = (this.buf[8] * matrix.buf[1] + this.buf[9] * matrix.buf[5]
               + this.buf[10] * matrix.buf[9] + this.buf[11] * matrix.buf[13]);
    var m33 = (this.buf[8] * matrix.buf[2] + this.buf[9] * matrix.buf[6]
               + this.buf[10] * matrix.buf[10] + this.buf[11] * matrix.buf[14]);
    var m34 = (this.buf[8] * matrix.buf[3] + this.buf[9] * matrix.buf[7]
               + this.buf[10] * matrix.buf[11] + this.buf[11] * matrix.buf[15]);

    var m41 = (this.buf[12] * matrix.buf[0] + this.buf[13] * matrix.buf[4]
               + this.buf[14] * matrix.buf[8] + this.buf[15] * matrix.buf[12]);
    var m42 = (this.buf[12] * matrix.buf[1] + this.buf[13] * matrix.buf[5]
               + this.buf[14] * matrix.buf[9] + this.buf[15] * matrix.buf[13]);
    var m43 = (this.buf[12] * matrix.buf[2] + this.buf[13] * matrix.buf[6]
               + this.buf[14] * matrix.buf[10] + this.buf[15] * matrix.buf[14]);
    var m44 = (this.buf[12] * matrix.buf[3] + this.buf[13] * matrix.buf[7]
               + this.buf[14] * matrix.buf[11] + this.buf[15] * matrix.buf[15]);
    
    this.buf[0] = m11;
    this.buf[1] = m12;
    this.buf[2] = m13;
    this.buf[3] = m14;
    
    this.buf[4] = m21;
    this.buf[5] = m22;
    this.buf[6] = m23;
    this.buf[7] = m24;
    
    this.buf[8] = m31;
    this.buf[9] = m32;
    this.buf[10] = m33;
    this.buf[11] = m34;
    
    this.buf[12] = m41;
    this.buf[13] = m42;
    this.buf[14] = m43;
    this.buf[15] = m44;
    return this ;
}

CanvasMatrix4.prototype.multLeft = function(matrix)
{
    var m11 = (matrix.buf[0] * this.buf[0] + matrix.buf[1] * this.buf[4]
               + matrix.buf[2] * this.buf[8] + matrix.buf[3] * this.buf[12]);
    var m12 = (matrix.buf[0] * this.buf[1] + matrix.buf[1] * this.buf[5]
               + matrix.buf[2] * this.buf[9] + matrix.buf[3] * this.buf[13]);
    var m13 = (matrix.buf[0] * this.buf[2] + matrix.buf[1] * this.buf[6]
               + matrix.buf[2] * this.buf[10] + matrix.buf[3] * this.buf[14]);
    var m14 = (matrix.buf[0] * this.buf[3] + matrix.buf[1] * this.buf[7]
               + matrix.buf[2] * this.buf[11] + matrix.buf[3] * this.buf[15]);

    var m21 = (matrix.buf[4] * this.buf[0] + matrix.buf[5] * this.buf[4]
               + matrix.buf[6] * this.buf[8] + matrix.buf[7] * this.buf[12]);
    var m22 = (matrix.buf[4] * this.buf[1] + matrix.buf[5] * this.buf[5]
               + matrix.buf[6] * this.buf[9] + matrix.buf[7] * this.buf[13]);
    var m23 = (matrix.buf[4] * this.buf[2] + matrix.buf[5] * this.buf[6]
               + matrix.buf[6] * this.buf[10] + matrix.buf[7] * this.buf[14]);
    var m24 = (matrix.buf[4] * this.buf[3] + matrix.buf[5] * this.buf[7]
               + matrix.buf[6] * this.buf[11] + matrix.buf[7] * this.buf[15]);

    var m31 = (matrix.buf[8] * this.buf[0] + matrix.buf[9] * this.buf[4]
               + matrix.buf[10] * this.buf[8] + matrix.buf[11] * this.buf[12]);
    var m32 = (matrix.buf[8] * this.buf[1] + matrix.buf[9] * this.buf[5]
               + matrix.buf[10] * this.buf[9] + matrix.buf[11] * this.buf[13]);
    var m33 = (matrix.buf[8] * this.buf[2] + matrix.buf[9] * this.buf[6]
               + matrix.buf[10] * this.buf[10] + matrix.buf[11] * this.buf[14]);
    var m34 = (matrix.buf[8] * this.buf[3] + matrix.buf[9] * this.buf[7]
               + matrix.buf[10] * this.buf[11] + matrix.buf[11] * this.buf[15]);

    var m41 = (matrix.buf[12] * this.buf[0] + matrix.buf[13] * this.buf[4]
               + matrix.buf[14] * this.buf[8] + matrix.buf[15] * this.buf[12]);
    var m42 = (matrix.buf[12] * this.buf[1] + matrix.buf[13] * this.buf[5]
               + matrix.buf[14] * this.buf[9] + matrix.buf[15] * this.buf[13]);
    var m43 = (matrix.buf[12] * this.buf[2] + matrix.buf[13] * this.buf[6]
               + matrix.buf[14] * this.buf[10] + matrix.buf[15] * this.buf[14]);
    var m44 = (matrix.buf[12] * this.buf[3] + matrix.buf[13] * this.buf[7]
               + matrix.buf[14] * this.buf[11] + matrix.buf[15] * this.buf[15]);
    
    this.buf[0] = m11;
    this.buf[1] = m12;
    this.buf[2] = m13;
    this.buf[3] = m14;

    this.buf[4] = m21;
    this.buf[5] = m22;
    this.buf[6] = m23;
    this.buf[7] = m24;

    this.buf[8] = m31;
    this.buf[9] = m32;
    this.buf[10] = m33;
    this.buf[11] = m34;

    this.buf[12] = m41;
    this.buf[13] = m42;
    this.buf[14] = m43;
    this.buf[15] = m44;
    return this ;
}

CanvasMatrix4.prototype.ortho = function(left, right, bottom, top, near, far)
{
    var tx = (left + right) / (right - left);
    var ty = (top + bottom) / (top - bottom);
    var tz = (far + near) / (far - near);
    
    this.initmatrix()
    this.matrix.buf[0] = 2 / (right - left);
    this.matrix.buf[5] = 2 / (top - bottom);
    this.matrix.buf[10] = -2 / (far - near);
    this.matrix.buf[12] = tx;
    this.matrix.buf[13] = ty;
    this.matrix.buf[14] = -tz;
    
    this.multRight(this.matrix);
    return this ;
}

CanvasMatrix4.prototype.frustum = function(left, right, bottom, top, near, far)
{
    this.initmatrix()
    var A = (right + left) / (right - left);
    var B = (top + bottom) / (top - bottom);
    var C = -(far + near) / (far - near);
    var D = -(2 * far * near) / (far - near);
    
    this.matrix.buf[0] = (2 * near) / (right - left);
    
    this.matrix.buf[5] = 2 * near / (top - bottom);
    
    this.matrix.buf[8] = A;
    this.matrix.buf[9] = B;
    this.matrix.buf[10] = C;
    this.matrix.buf[11] = -1;
    
    this.matrix.buf[14] = D;
    this.matrix.buf[15] = 0;
    
    this.multRight(this.matrix);
    return this ;
}

CanvasMatrix4.prototype.perspective = function(fovy, aspect, zNear, zFar)
{
    var top = Math.tan(fovy * Math.PI / 360) * zNear;
    var bottom = -top;
    var left = aspect * bottom;
    var right = aspect * top;
    this.frustum(left, right, bottom, top, zNear, zFar);
    return this ;
}
CanvasMatrix4.prototype.pallarel = function(width, aspect, zNear, zFar)
{
    var right = width/2;
    var left = -right;
	var top = right / aspect ;
	var bottom = -top ;
    this.ortho(left, right, bottom, top, zNear, zFar);
    return this ;
}
CanvasMatrix4.prototype.lookat = function(eyex, eyey, eyez, centerx, centery, centerz, upx, upy, upz)
{
    this.initmatrix()
    
    // Make rotation matrix

    // Z vector
    var zx = eyex - centerx;
    var zy = eyey - centery;
    var zz = eyez - centerz;
    var mag = Math.hypot(zx,zy,zz);
    if (mag) {
        zx /= mag;
        zy /= mag;
        zz /= mag;
    }

    // X vector = Y cross Z
    xx =  upy * zz - upz * zy;
    xy = -upx * zz + upz * zx;
    xz =  upx * zy - upy * zx;

    // Recompute Y = Z cross X
    yx = zy * xz - zz * xy;
    yy = -zx * xz + zz * xx;
    yz = zx * xy - zy * xx;

    // cross product gives area of parallelogram, which is < 1.0 for
    // non-perpendicular unit-length vectors; so normalize x, y here

    mag = Math.hypot(xx,xy,xz);
    if (mag) {
        xx /= mag;
        xy /= mag;
        xz /= mag;
    }

    mag = Math.hypot(yx,yy,yz);
    if (mag) {
        yx /= mag;
        yy /= mag;
        yz /= mag;
    }

    this.matrix.buf[0] = xx;
    this.matrix.buf[1] = yx;
    this.matrix.buf[2] = zx;
    
    this.matrix.buf[4] = xy;
    this.matrix.buf[5] = yy;
    this.matrix.buf[6] = zy;
    
    this.matrix.buf[8] = xz;
    this.matrix.buf[9] = yz;
    this.matrix.buf[10] = zz;
    
    this.matrix.buf[12] = -(xx * eyex + xy * eyey + xz * eyez);
    this.matrix.buf[13] = -(yx * eyex + yy * eyey + yz * eyez);
    this.matrix.buf[14] = -(zx * eyex + zy * eyey + zz * eyez);
 //   matrix.translate(-eyex, -eyey, -eyez);
    
    this.multRight(this.matrix);
    return this ;
}

// Support functions
CanvasMatrix4.prototype._determinant2x2 = function(a, b, c, d)
{
    return a * d - b * c;
}

CanvasMatrix4.prototype._determinant3x3 = function(a1, a2, a3, b1, b2, b3, c1, c2, c3)
{
    return a1 * this._determinant2x2(b2, b3, c2, c3)
         - b1 * this._determinant2x2(a2, a3, c2, c3)
         + c1 * this._determinant2x2(a2, a3, b2, b3);
}

CanvasMatrix4.prototype._determinant4x4 = function()
{
    var a1 = this.buf[0];
    var b1 = this.buf[1]; 
    var c1 = this.buf[2];
    var d1 = this.buf[3];

    var a2 = this.buf[4];
    var b2 = this.buf[5]; 
    var c2 = this.buf[6];
    var d2 = this.buf[7];

    var a3 = this.buf[8];
    var b3 = this.buf[9]; 
    var c3 = this.buf[10];
    var d3 = this.buf[11];

    var a4 = this.buf[12];
    var b4 = this.buf[13]; 
    var c4 = this.buf[14];
    var d4 = this.buf[15];

    return a1 * this._determinant3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4)
         - b1 * this._determinant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4)
         + c1 * this._determinant3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4)
         - d1 * this._determinant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);
}

CanvasMatrix4.prototype._makeAdjoint = function()
{
    var a1 = this.buf[0];
    var b1 = this.buf[1]; 
    var c1 = this.buf[2];
    var d1 = this.buf[3];

    var a2 = this.buf[4];
    var b2 = this.buf[5]; 
    var c2 = this.buf[6];
    var d2 = this.buf[7];

    var a3 = this.buf[8];
    var b3 = this.buf[9]; 
    var c3 = this.buf[10];
    var d3 = this.buf[11];

    var a4 = this.buf[12];
    var b4 = this.buf[13]; 
    var c4 = this.buf[14];
    var d4 = this.buf[15];

    // Row column labeling reversed since we transpose rows & columns
    this.buf[0]  =   this._determinant3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4);
    this.buf[4]  = - this._determinant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4);
    this.buf[8]  =   this._determinant3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4);
    this.buf[12]  = - this._determinant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);
        
    this.buf[1]  = - this._determinant3x3(b1, b3, b4, c1, c3, c4, d1, d3, d4);
    this.buf[5]  =   this._determinant3x3(a1, a3, a4, c1, c3, c4, d1, d3, d4);
    this.buf[9]  = - this._determinant3x3(a1, a3, a4, b1, b3, b4, d1, d3, d4);
    this.buf[13]  =   this._determinant3x3(a1, a3, a4, b1, b3, b4, c1, c3, c4);
        
    this.buf[2]  =   this._determinant3x3(b1, b2, b4, c1, c2, c4, d1, d2, d4);
    this.buf[6]  = - this._determinant3x3(a1, a2, a4, c1, c2, c4, d1, d2, d4);
    this.buf[10]  =   this._determinant3x3(a1, a2, a4, b1, b2, b4, d1, d2, d4);
    this.buf[14]  = - this._determinant3x3(a1, a2, a4, b1, b2, b4, c1, c2, c4);
        
    this.buf[3]  = - this._determinant3x3(b1, b2, b3, c1, c2, c3, d1, d2, d3);
    this.buf[7]  =   this._determinant3x3(a1, a2, a3, c1, c2, c3, d1, d2, d3);
    this.buf[11]  = - this._determinant3x3(a1, a2, a3, b1, b2, b3, d1, d2, d3);
    this.buf[15]  =   this._determinant3x3(a1, a2, a3, b1, b2, b3, c1, c2, c3);
}

////utils 
//vec3 operations
	CanvasMatrix4.V3add = function() {
		let x=0,y=0,z=0 ;
		for(let i=0;i<arguments.length;i++) {
			x += arguments[i][0] ;y += arguments[i][1] ;z += arguments[i][2] ;
		}
		return [x,y,z] ;
	}
	CanvasMatrix4.V3sub = function() {
		let x=arguments[0][0],y=arguments[0][1],z=arguments[0][2] ;
		for(let i=1;i<arguments.length;i++) {
			x -= arguments[i][0] ;y -= arguments[i][1] ;z -= arguments[i][2] ;
		}
		return [x,y,z] ;
	}
	CanvasMatrix4.V3inv = function(v) {
		return [-v[0],-v[1],-v[2]] ;
	}
	CanvasMatrix4.V3len = function(v) {
		return Math.hypot(v[0],v[1],v[2]) ;
	}
	CanvasMatrix4.V3norm = function(v,s) {
		const l = CanvasMatrix4.V3len(v) ;
		if(s===undefined) s = 1 ;
		return (l==0)?[0,0,0]:[v[0]*s/l,v[1]*s/l,v[2]*s/l] ;
	}
	CanvasMatrix4.V3mult = function(v,s) {
		return [v[0]*s,v[1]*s,v[2]*s] ;
	}
	CanvasMatrix4.V3dot = function(v1,v2) {
		return v1[0]*v2[0]+v1[1]*v2[1]+v1[2]*v2[2] ;
	}
	CanvasMatrix4.V3cross = function(v1,v2) {
		return [	
			v1[1]*v2[2] - v1[2] * v2[1],
			v1[2]*v2[0] - v1[0] * v2[2],
			v1[0]*v2[1] - v1[1] * v2[0] 
		]
	}

//multiple vector
CanvasMatrix4.prototype.multVec4 = function(x,y,z,w) {
	if(Array.isArray(x)|| x instanceof Float32Array) {
		y = x[1]; z = x[2];w=x[3]; x = x[0];
	}
	var xx = this.buf[0]*x + this.buf[4]*y + this.buf[8]*z + this.buf[12]*w ;
	var yy = this.buf[1]*x + this.buf[5]*y + this.buf[9]*z + this.buf[13]*w ;
	var zz = this.buf[2]*x + this.buf[6]*y + this.buf[10]*z + this.buf[14]*w ;
	var ww = this.buf[3]*x + this.buf[7]*y + this.buf[11]*z + this.buf[15]*w ;
	return [xx,yy,zz,ww] ;
}

//shorthand class method 
CanvasMatrix4.rotAndTrans = function(rx,ry,rz,tx,ty,tz) {
	var m = new CanvasMatrix4()
	if(rx!=0) m.rotate(rx,1,0,0) 
	if(ry!=0) m.rotate(ry,0,1,0)
	if(rz!=0) m.rotate(rz,0,0,1)
	m.translate(tx,ty,tz)
	return m 
}

//quaternion to matrix
CanvasMatrix4.prototype.q2m = function(x,y,z,w) {
	if(Array.isArray(x) || x instanceof Float32Array) {
		y = x[1]; z = x[2];w=x[3]; x = x[0];
	}
	var x2 = x*x; var y2=y*y; var z2=z*z ;
	this.buf[0] = 1- 2*(y2 + z2) ;
	this.buf[1] = 2*(x*y + w*z) ;
	this.buf[2] = 2*(x*z - w*y) ;
	this.buf[3] = 0 ;
	this.buf[4] = 2*(x*y - w*z) ;
	this.buf[5] = 1-2*(x2 + z2) ;
	this.buf[6] = 2*(y*z + w*x) ;
	this.buf[7] = 0 ;
	this.buf[8] = 2*(x*z + w*y) ;
	this.buf[9] = 2*(y*z - w*x) ;
	this.buf[10] = 1-2*(x2 + y2) ;
	this.buf[11] = 0 ; this.buf[12]=0; this.buf[13]=0; this.buf[14]=0;this.buf[15]=1;
	return this 
}
CanvasMatrix4.v2q = function(rot,x,y,z) {
	if(Array.isArray(x) || x instanceof Float32Array) {
		y = x[1]; z = x[2]; x = x[0];
	}
	let l = x*x + y*y + z*z 
	if(l==0) return [0,0,0,1]
	if(l!=1) {
		l = Math.sqrt(l) 
		x /= l ; y /=l ; z /= l
	}
	rot = rot *CanvasMatrix4.RAD /2 
	let sr = Math.sin(rot) 
	return [x*sr,y*sr,z*sr,Math.cos(rot)]
}
CanvasMatrix4.e2q = function(x,y,z) {
	if(Array.isArray(x) || x instanceof Float32Array) {
		y = x[1]; z = x[2]; x = x[0];
	}
	x *= CanvasMatrix4.RAD*0.5
	y *= CanvasMatrix4.RAD*0.5
	z *= CanvasMatrix4.RAD*0.5
	let c1 = Math.cos(x),c2=Math.cos(y),c3=Math.cos(z)
	let s1 = Math.sin(x),s2=Math.sin(y),s3=Math.sin(z)
	// order YXZ
	let qx = s1 * c2 * c3 + c1 * s2 * s3;
    let qy = c1 * s2 * c3 - s1 * c2 * s3;
    let qz = c1 * c2 * s3 - s1 * s2 * c3;
    let qw = c1 * c2 * c3 + s1 * s2 * s3;
    return [qx,qy,qz,qw]
}
CanvasMatrix4.qMult = function(q1,q2) {
	let w = q1[3] * q2[3] -(q1[0]*q2[0]+q1[1]*q2[1]+q1[2]*q2[2])
	let x = q1[1]*q2[2] - q1[2] * q2[1] + q1[3]*q2[0] + q2[3]*q1[0]
	let y = q1[2]*q2[0] - q1[0] * q2[2] + q1[3]*q2[1] + q2[3]*q1[1]
 	let z = q1[0]*q2[1] - q1[1] * q2[0] + q1[3]*q2[2] + q2[3]*q1[2]
	return [x,y,z,w]	
}
	

