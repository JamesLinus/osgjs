'use strict';
var Vec3 = require( 'osg/Vec3' );
var Matrix = require( 'osg/Matrix' );
var TriangleSphereIntersector = require( 'osgUtil/TriangleSphereIntersector' );


var SphereIntersector = function () {
    this._center = Vec3.create();
    this._iCenter = Vec3.create();
    this._iRadius = 1.0;
    this._intersections = [];
};

SphereIntersector.prototype = {
    set: function ( center, radius ) {
        Vec3.copy( center, this._center );
        this._radius = radius;
        this.reset();
    },
    setCenter: function ( center ) {
        Vec3.copy( center, this._center );
    },
    setRadius: function ( radius ) {
        this._radius = radius;
    },
    reset: function () {
        // Clear the intersections vector
        this._intersections.length = 0;
    },
    enter: function ( node ) {
        // Not working if culling disabled ??
        return !node.isCullingActive() || this.intersects( node.getBound() );
    },
    // Intersection Sphere/Sphere 
    intersects: function ( bsphere ) {
        if ( !bsphere.valid() ) return false;
        // TODO
        return true;
        // var r = this._iRadius + bsphere.radius();
        // return Vec3.distance2( this._iCenter, bsphere.center() ) <= r * r;
    },

    intersect: ( function () {

        var ti = new TriangleSphereIntersector();

        return function ( iv, node ) {

            var kdtree = node.getShape();
            if ( kdtree )
                return kdtree.intersectSphere( this._iCenter, this._iRadius, this._intersections, iv.nodePath );

            ti.setNodePath( iv.nodePath );
            ti.set( this._iCenter, this._radius );
            ti.apply( node );
            var l = ti._intersections.length;
            if ( l > 0 ) {
                // Intersection/s exists
                for ( var i = 0; i < l; i++ ) {
                    this._intersections.push( ti._intersections[ i ] );
                }
                return true;
            }

            // No intersection found
            return false;
        };
    } )(),
    getIntersections: function () {
        return this._intersections;
    },
    setCurrentTransformation: function ( matrix ) {
        Matrix.inverse( matrix, matrix );
        Matrix.transformVec3( matrix, this._center, this._iCenter );
        this._iRadius = this._radius * Matrix.getScale( matrix, [] )[ 0 ];
    }
};

module.exports = SphereIntersector;
